using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MccPortfolioBackend.Data;

namespace MccPortfolioBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PublicPortfolioController : ControllerBase
    {
        private readonly MccDbContext _context;

        public PublicPortfolioController(MccDbContext context)
        {
            _context = context;
        }

        [HttpGet("{username}")]
        public async Task<IActionResult> GetPublicPortfolio(string username)
        {
            var user = await _context.Users
                .Include(u => u.Profile)
                .Include(u => u.AcademicRecords)
                .Include(u => u.Certifications)
                .Include(u => u.Activities)
                .Include(u => u.Projects)
                .Include(u => u.ResearchInnovations)
                .FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower());

            if (user == null)
            {
                return NotFound(new { message = "Student portfolio not found" });
            }

            // Check if requester is authorized to preview unapproved portfolios
            bool allowPreview = false;
            Guid? requestUserId = null;
            string? requestUserRole = null;

            // Check JWT claims
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(userIdClaim, out var jwtUserId))
            {
                requestUserId = jwtUserId;
                requestUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            }
            // Fallback to legacy headers
            else if (Request.Headers.TryGetValue("X-User-Id", out var idStr) && Guid.TryParse(idStr.ToString(), out var legacyUserId))
            {
                requestUserId = legacyUserId;
            }

            if (requestUserId != null)
            {
                if (user.Id == requestUserId)
                {
                    allowPreview = true;
                }
                else
                {
                    if (!string.IsNullOrEmpty(requestUserRole))
                    {
                        if (requestUserRole == "Admin" || requestUserRole == "Staff")
                        {
                            allowPreview = true;
                        }
                    }
                    else
                    {
                        var requester = await _context.Users.FindAsync(requestUserId);
                        if (requester != null && (requester.Role == "Admin" || requester.Role == "Staff"))
                        {
                            allowPreview = true;
                        }
                    }
                }
            }

            // Return basic status info if not approved and not authorized to preview
            if (!user.IsApproved && !allowPreview)
            {
                return Ok(new
                {
                    isApproved = false,
                    isPreview = false,
                    name = user.Name,
                    department = user.Department,
                    message = "This portfolio is currently pending institutional review from MCC staff."
                });
            }

            return Ok(new
            {
                isApproved = user.IsApproved,
                isPreview = !user.IsApproved,
                id = user.Id,
                name = user.Name,
                email = user.Email,
                gender = user.Gender,
                department = user.Department,
                username = user.Username,
                profile = user.Profile != null ? new
                {
                    user.Profile.Bio,
                    user.Profile.Phone,
                    user.Profile.PersonalEmail,
                    user.Profile.PersonalStory,
                    user.Profile.Sop,
                    user.Profile.ProfileImageUrl,
                    user.Profile.Skills,
                    user.Profile.Theme,
                    user.Profile.GitHubUsername,
                    user.Profile.BehanceUsername
                } : null,
                academicRecords = user.AcademicRecords.OrderByDescending(r => r.EndYear).ToList(),
                certifications = user.Certifications.OrderByDescending(c => c.IssueDate).ToList(),
                activities = user.Activities.OrderByDescending(a => a.StartDate).ToList(),
                projects = user.Projects.ToList(),
                researchInnovations = user.ResearchInnovations.OrderByDescending(r => r.Date).ToList()
            });
        }
    }
}
