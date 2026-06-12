using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MccPortfolio.Api.Data;
using MccPortfolio.Api.Entities;

namespace MccPortfolio.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentAffairsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StudentAffairsController(AppDbContext context)
        {
            _context = context;
        }

        private Guid GetCurrentUserId()
        {
            var str = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(str, out Guid id) ? id : Guid.Empty;
        }

        // ──────────────────────────────────────────────────────────────────────────
        // ANNOUNCEMENTS
        // ──────────────────────────────────────────────────────────────────────────

        /// <summary>Public endpoint — all active announcements</summary>
        [AllowAnonymous]
        [HttpGet("announcements")]
        public async Task<IActionResult> GetAnnouncements()
        {
            var items = await _context.Announcements
                .Where(a => a.IsActive)
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new
                {
                    a.Id,
                    a.Title,
                    a.Body,
                    a.Category,
                    a.IsActive,
                    a.CreatedAt,
                    CreatedBy = a.CreatedBy != null ? a.CreatedBy.Name : "Admin"
                })
                .ToListAsync();

            return Ok(items);
        }

        /// <summary>Admin — all announcements including inactive</summary>
        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpGet("announcements/all")]
        public async Task<IActionResult> GetAllAnnouncements()
        {
            var items = await _context.Announcements
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new
                {
                    a.Id,
                    a.Title,
                    a.Body,
                    a.Category,
                    a.IsActive,
                    a.CreatedAt,
                    CreatedBy = a.CreatedBy != null ? a.CreatedBy.Name : "Admin"
                })
                .ToListAsync();

            return Ok(items);
        }

        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpPost("announcements")]
        public async Task<IActionResult> CreateAnnouncement([FromBody] AnnouncementRequest req)
        {
            var announcement = new Announcement
            {
                Title = req.Title,
                Body = req.Body,
                Category = req.Category,
                IsActive = req.IsActive,
                CreatedByUserId = GetCurrentUserId()
            };

            _context.Announcements.Add(announcement);
            await _context.SaveChangesAsync();

            return Ok(new { announcement.Id, announcement.Title, announcement.Body, announcement.Category, announcement.IsActive, announcement.CreatedAt });
        }

        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpPut("announcements/{id}")]
        public async Task<IActionResult> UpdateAnnouncement(Guid id, [FromBody] AnnouncementRequest req)
        {
            var a = await _context.Announcements.FindAsync(id);
            if (a == null) return NotFound();

            a.Title = req.Title;
            a.Body = req.Body;
            a.Category = req.Category;
            a.IsActive = req.IsActive;

            await _context.SaveChangesAsync();
            return Ok(new { a.Id, a.Title, a.Body, a.Category, a.IsActive, a.CreatedAt });
        }

        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpDelete("announcements/{id}")]
        public async Task<IActionResult> DeleteAnnouncement(Guid id)
        {
            var a = await _context.Announcements.FindAsync(id);
            if (a == null) return NotFound();

            _context.Announcements.Remove(a);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        // ──────────────────────────────────────────────────────────────────────────
        // GRIEVANCES
        // ──────────────────────────────────────────────────────────────────────────

        /// <summary>Student — view own grievances</summary>
        [Authorize(Roles = "Student")]
        [HttpGet("grievances/mine")]
        public async Task<IActionResult> GetMyGrievances()
        {
            var userId = GetCurrentUserId();
            var profile = await _context.StudentProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile == null) return NotFound("Student profile not found.");

            var grievances = await _context.Grievances
                .Where(g => g.StudentProfileId == profile.Id)
                .OrderByDescending(g => g.CreatedAt)
                .Select(g => new
                {
                    g.Id,
                    g.Subject,
                    g.Description,
                    g.Status,
                    g.AdminReply,
                    g.CreatedAt,
                    g.ResolvedAt
                })
                .ToListAsync();

            return Ok(grievances);
        }

        /// <summary>Student — submit a grievance</summary>
        [Authorize(Roles = "Student")]
        [HttpPost("grievances")]
        public async Task<IActionResult> SubmitGrievance([FromBody] GrievanceRequest req)
        {
            var userId = GetCurrentUserId();
            var profile = await _context.StudentProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile == null) return NotFound("Student profile not found.");

            var grievance = new Grievance
            {
                StudentProfileId = profile.Id,
                Subject = req.Subject,
                Description = req.Description,
                Status = "Open"
            };

            _context.Grievances.Add(grievance);
            await _context.SaveChangesAsync();

            return Ok(new { grievance.Id, grievance.Subject, grievance.Description, grievance.Status, grievance.CreatedAt });
        }

        /// <summary>Admin — view all grievances</summary>
        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpGet("grievances")]
        public async Task<IActionResult> GetAllGrievances()
        {
            var grievances = await _context.Grievances
                .Include(g => g.StudentProfile)
                    .ThenInclude(p => p!.User)
                .OrderByDescending(g => g.CreatedAt)
                .Select(g => new
                {
                    g.Id,
                    g.Subject,
                    g.Description,
                    g.Status,
                    g.AdminReply,
                    g.CreatedAt,
                    g.ResolvedAt,
                    StudentName = g.StudentProfile != null && g.StudentProfile.User != null ? g.StudentProfile.User.Name : "Unknown",
                    StudentEmail = g.StudentProfile != null && g.StudentProfile.User != null ? g.StudentProfile.User.Email : "",
                    StudentProfileId = g.StudentProfileId
                })
                .ToListAsync();

            return Ok(grievances);
        }

        /// <summary>Admin — reply to a grievance and set status</summary>
        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpPut("grievances/{id}/respond")]
        public async Task<IActionResult> RespondToGrievance(Guid id, [FromBody] GrievanceResponse resp)
        {
            var g = await _context.Grievances.FindAsync(id);
            if (g == null) return NotFound();

            g.AdminReply = resp.AdminReply;
            g.Status = resp.Status;

            if (resp.Status == "Resolved" || resp.Status == "Dismissed")
                g.ResolvedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { g.Id, g.Status, g.AdminReply, g.ResolvedAt });
        }
    }

    // ── Request DTOs ──────────────────────────────────────────────────────────────

    public record AnnouncementRequest(string Title, string Body, string Category, bool IsActive);
    public record GrievanceRequest(string Subject, string Description);
    public record GrievanceResponse(string AdminReply, string Status);
}
