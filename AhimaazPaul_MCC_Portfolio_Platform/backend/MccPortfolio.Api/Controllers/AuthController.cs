using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MccPortfolio.Api.Data;
using MccPortfolio.Api.Entities;
using MccPortfolio.Api.Utils;

namespace MccPortfolio.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpGet("departments")]
        public async Task<IActionResult> GetDepartments()
        {
            var depts = await _context.Departments.ToListAsync();
            return Ok(depts);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { message = "Email is already registered" });
            }

            var role = (request.Role ?? "Student").Trim();
            if (role != "SuperAdmin" && role != "Student" && role != "Admin")
            {
                role = "Student";
            }

            if (role == "Admin")
            {
                role = "PendingAdmin";
            }

            string slug = string.Empty;
            StudentProfile? profile = null;

            if (role == "Student")
            {
                slug = (request.UsernameSlug ?? "").ToLower().Trim();
                if (string.IsNullOrEmpty(slug))
                {
                    return BadRequest(new { message = "Username URL slug is required for student accounts" });
                }

                if (!request.DepartmentId.HasValue || request.DepartmentId.Value == Guid.Empty)
                {
                    return BadRequest(new { message = "Department is required for student accounts" });
                }

                if (await _context.StudentProfiles.AnyAsync(p => p.UsernameSlug == slug))
                {
                    return BadRequest(new { message = "Username URL slug is already taken" });
                }
            }

            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                PasswordHash = PasswordHasher.HashPassword(request.Password),
                Role = role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            if (role == "Student")
            {
                profile = new StudentProfile
                {
                    UserId = user.Id,
                    DepartmentId = request.DepartmentId!.Value,
                    UsernameSlug = slug,
                    RegistrationNumber = request.RegistrationNumber ?? string.Empty,
                    Theme = "Apple-Minimal",
                    IsApproved = false // requires Super Admin approval
                };

                _context.StudentProfiles.Add(profile);
                await _context.SaveChangesAsync();

                // Auto-create a welcome notification
                var notification = new Notification
                {
                    UserId = user.Id,
                    Title = "Welcome to MCC Portfolios!",
                    Message = $"Welcome {user.Name}! Complete your bio, projects, and certifications, then submit your portfolio for approval.",
                    IsRead = false
                };
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();
            }

            if (role == "PendingAdmin")
            {
                return Ok(new
                {
                    message = "Admin account registered successfully and is pending approval by the Super Admin.",
                    requiresApproval = true
                });
            }

            var token = GenerateJwtToken(user);

            return Ok(new AuthResponse
            {
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Role = user.Role,
                    UsernameSlug = slug,
                    ProfileId = profile?.Id
                }
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users
                .Include(u => u.StudentProfile)
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || !PasswordHasher.VerifyPassword(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            if (user.Role == "PendingAdmin")
            {
                return BadRequest(new { message = "Your admin account is pending approval by the Super Admin." });
            }

            var token = GenerateJwtToken(user);

            return Ok(new AuthResponse
            {
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Role = user.Role,
                    UsernameSlug = user.StudentProfile?.UsernameSlug ?? string.Empty,
                    ProfileId = user.StudentProfile?.Id
                }
            });
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtKey = _config["Jwt:Key"] ?? "SuperSecretKeyForMccPortfolioPlatform123!";
            var key = Encoding.ASCII.GetBytes(jwtKey);
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }

    public class RegisterRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public Guid? DepartmentId { get; set; }
        public string UsernameSlug { get; set; } = string.Empty;
        public string Role { get; set; } = "Student";
        public string RegistrationNumber { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public UserDto User { get; set; } = null!;
    }

    public class UserDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string UsernameSlug { get; set; } = string.Empty;
        public Guid? ProfileId { get; set; }
    }
}
