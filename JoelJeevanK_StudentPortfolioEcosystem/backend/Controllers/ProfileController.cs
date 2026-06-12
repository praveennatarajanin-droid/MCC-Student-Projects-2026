using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MccPortfolioBackend.Data;
using MccPortfolioBackend.Models;
using MccPortfolioBackend.DTOs;

using Microsoft.AspNetCore.Authorization;

namespace MccPortfolioBackend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly MccDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ProfileController(MccDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        private Guid? GetRequestUserId()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }
            if (Request.Headers.TryGetValue("X-User-Id", out var userIdStr) && Guid.TryParse(userIdStr, out var legacyUserId))
            {
                return legacyUserId;
            }
            return null;
        }

        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access - X-User-Id header missing or invalid" });

            var user = await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(new
            {
                user.Id,
                user.Name,
                user.Email,
                user.Gender,
                user.Department,
                user.Role,
                user.Username,
                user.IsApproved,
                Profile = user.Profile != null ? new
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
                } : null
            });
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] StudentProfileUpdateDto dto)
        {
            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            var profile = await _context.StudentProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile == null)
            {
                profile = new StudentProfile { UserId = userId.Value };
                _context.StudentProfiles.Add(profile);
            }

            profile.Bio = dto.Bio;
            profile.Phone = dto.Phone;
            profile.PersonalEmail = dto.PersonalEmail;
            profile.PersonalStory = dto.PersonalStory;
            profile.Sop = dto.Sop;
            profile.Skills = dto.Skills;
            profile.Theme = dto.Theme;
            profile.GitHubUsername = dto.GitHubUsername;
            profile.BehanceUsername = dto.BehanceUsername;

            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                user.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Profile updated successfully" });
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            var profile = await _context.StudentProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile == null)
                return NotFound(new { message = "Profile not found" });

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var extension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Only image files (.jpg, .jpeg, .png, .gif) are allowed" });

            var fileName = $"{userId}_{DateTime.UtcNow.Ticks}{extension}";
            var folderPath = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "profiles");
            var filePath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            profile.ProfileImageUrl = $"/uploads/profiles/{fileName}";
            await _context.SaveChangesAsync();

            return Ok(new { imageUrl = profile.ProfileImageUrl });
        }

        [HttpGet("notifications")]
        public async Task<IActionResult> GetNotifications([FromQuery] bool all = false)
        {
            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            var query = _context.Notifications
                .Where(n => n.UserId == userId);

            if (!all)
            {
                query = query.Where(n => !n.IsRead);
            }

            var notifications = await query
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return Ok(notifications);
        }

        [HttpPost("notifications/{id}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if (notification == null)
                return NotFound(new { message = "Notification not found" });

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Notification marked as read" });
        }
    }
}
