using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using MCC.Portfolio.API.Data;
using MCC.Portfolio.API.Dtos;
using MCC.Portfolio.API.Models;
using MCC.Portfolio.API.Services;
using Microsoft.Extensions.Configuration;

namespace MCC.Portfolio.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITokenService _tokenService;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, ITokenService tokenService, IConfiguration configuration)
        {
            _context = context;
            _tokenService = tokenService;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
            {
                return BadRequest("Email is already registered.");
            }

            var allowedRoles = new[] { "Student", "Admin", "PlacementCoordinator", "ResearchCoordinator", "InnovationCoordinator", "Faculty", "StudentAffairsCoordinator" };
            var role = string.IsNullOrEmpty(dto.Role) ? "Student" : dto.Role;
            if (!allowedRoles.Contains(role))
            {
                return BadRequest("Invalid registration role specified.");
            }

            if (role == "Student")
            {
                if (string.IsNullOrEmpty(dto.RollNumber))
                {
                    return BadRequest("Roll Number is required for students.");
                }
                if (await _context.Students.AnyAsync(s => s.RollNumber.ToLower() == dto.RollNumber.ToLower()))
                {
                    return BadRequest("Roll Number is already registered.");
                }
            }
            else
            {
                if (role == "Admin")
                {
                    var adminSecret = _configuration["FacultySettings:AdminVerificationCode"] ?? "MCC-ADMIN-2026";
                    if (dto.VerificationCode != adminSecret)
                    {
                        return BadRequest("Invalid Admin Verification Code.");
                    }
                }
                else
                {
                    var staffSecret = _configuration["FacultySettings:StaffVerificationCode"] ?? "MCC-FACULTY-2026";
                    if (dto.VerificationCode != staffSecret)
                    {
                        return BadRequest("Invalid Staff/Faculty Verification Code.");
                    }
                }
            }

            // Create User
            var user = new User
            {
                Email = dto.Email.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = role,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Department = dto.Department,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            Student? student = null;
            Models.Portfolio? portfolio = null;

            if (role == "Student")
            {
                // Generate clean URL slug from name
                var baseSlug = $"{dto.FirstName.ToLower()}-{dto.LastName.ToLower()}".Replace(" ", "-");
                var slug = baseSlug;
                int count = 1;
                while (await _context.Portfolios.AnyAsync(p => p.Slug == slug))
                {
                    slug = $"{baseSlug}-{count++}";
                }

                // Create Student Profile
                student = new Student
                {
                    UserId = user.Id,
                    RollNumber = dto.RollNumber!,
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    Department = dto.Department ?? "Computer Applications (MCA)",
                    BatchYear = dto.BatchYear ?? "2024-2026",
                    Bio = $"Student at Madras Christian College.",
                    AvatarUrl = ""
                };

                _context.Students.Add(student);
                await _context.SaveChangesAsync();

                // Create default Portfolio Config
                portfolio = new Models.Portfolio
                {
                    StudentId = student.Id,
                    Slug = slug,
                    IsPublic = true,
                    IsApproved = true, // Default to approved on registration
                    LayoutSettingsJson = "{\"theme\":\"academic\",\"visibleSections\":[\"about\",\"projects\",\"publications\",\"certifications\",\"achievements\",\"community\"]}",
                    StatementOfPurpose = "",
                    StoryTitle = "About Me",
                    StoryContent = ""
                };

                _context.Portfolios.Add(portfolio);
                await _context.SaveChangesAsync();
            }

            var token = _tokenService.CreateToken(user);

            var userResponse = new UserResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                Role = user.Role,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Department = user.Department
            };

            if (student != null && portfolio != null)
            {
                userResponse.StudentId = student.Id;
                userResponse.RollNumber = student.RollNumber;
                userResponse.AvatarUrl = student.AvatarUrl;
                userResponse.Slug = portfolio.Slug;
                userResponse.Department = student.Department;
            }

            return new AuthResponseDto
            {
                Token = token,
                User = userResponse
            };
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
        {
            var user = await _context.Users
                .Include(u => u.Student)
                .ThenInclude(s => s!.Portfolio)
                .SingleOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());

            if (user == null)
            {
                return Unauthorized("Invalid credentials.");
            }

            var result = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);

            if (!result)
            {
                return Unauthorized("Invalid credentials.");
            }

            var token = _tokenService.CreateToken(user);

            var userResponse = new UserResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                Role = user.Role,
                Department = user.Department
            };

            if (user.Student != null)
            {
                userResponse.StudentId = user.Student.Id;
                userResponse.RollNumber = user.Student.RollNumber;
                userResponse.FirstName = user.Student.FirstName;
                userResponse.LastName = user.Student.LastName;
                userResponse.AvatarUrl = user.Student.AvatarUrl;
                userResponse.Slug = user.Student.Portfolio?.Slug;
                userResponse.Department = user.Student.Department;
            }
            else
            {
                userResponse.FirstName = user.FirstName;
                userResponse.LastName = user.LastName;
            }

            return new AuthResponseDto
            {
                Token = token,
                User = userResponse
            };
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<UserResponseDto>> GetCurrentUser()
        {
            var nameIdentifierClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("nameid");
            if (nameIdentifierClaim == null)
            {
                return Unauthorized("No valid claims found.");
            }

            if (!Guid.TryParse(nameIdentifierClaim.Value, out Guid userId))
            {
                return Unauthorized("Invalid user ID in claims.");
            }

            var user = await _context.Users
                .Include(u => u.Student)
                .ThenInclude(s => s!.Portfolio)
                .SingleOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            var userResponse = new UserResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                Role = user.Role,
                Department = user.Department
            };

            if (user.Student != null)
            {
                userResponse.StudentId = user.Student.Id;
                userResponse.RollNumber = user.Student.RollNumber;
                userResponse.FirstName = user.Student.FirstName;
                userResponse.LastName = user.Student.LastName;
                userResponse.AvatarUrl = user.Student.AvatarUrl;
                userResponse.Slug = user.Student.Portfolio?.Slug;
                userResponse.Department = user.Student.Department;
            }
            else
            {
                userResponse.FirstName = user.FirstName;
                userResponse.LastName = user.LastName;
            }

            return userResponse;
        }


    }
}
