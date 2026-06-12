using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentPortfolio.API.Data;
using StudentPortfolio.API.Models;

namespace StudentPortfolio.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        // ──────────── ANALYTICS ────────────
        [HttpGet("analytics")]
        public async Task<IActionResult> GetAnalytics()
        {
            var totalStudents = await _context.StudentProfiles.CountAsync(p => p.User != null && p.User.Role == "Student");
            var approvedStudents = await _context.StudentProfiles.CountAsync(p => p.Approved && p.User != null && p.User.Role == "Student");
            
            var totalProjects = await _context.Projects.CountAsync(p => _context.StudentProfiles.Any(sp => sp.Id == p.ProfileId && sp.User != null && sp.User.Role == "Student"));
            var totalResearch = await _context.ResearchPapers.CountAsync(p => _context.StudentProfiles.Any(sp => sp.Id == p.ProfileId && sp.User != null && sp.User.Role == "Student"));
            var totalCerts = await _context.Certifications.CountAsync(p => _context.StudentProfiles.Any(sp => sp.Id == p.ProfileId && sp.User != null && sp.User.Role == "Student"));
            var totalCreative = await _context.CreativeWorks.CountAsync(p => _context.StudentProfiles.Any(sp => sp.Id == p.ProfileId && sp.User != null && sp.User.Role == "Student"));
            var totalAchievements = await _context.Achievements.CountAsync(p => _context.StudentProfiles.Any(sp => sp.Id == p.ProfileId && sp.User != null && sp.User.Role == "Student"));
            var totalCommunity = await _context.CommunityServices.CountAsync(p => _context.StudentProfiles.Any(sp => sp.Id == p.ProfileId && sp.User != null && sp.User.Role == "Student"));
            var totalHackathons = await _context.Hackathons.CountAsync(p => _context.StudentProfiles.Any(sp => sp.Id == p.ProfileId && sp.User != null && sp.User.Role == "Student"));

            var departmentPerformance = await _context.StudentProfiles
                .Where(p => !string.IsNullOrEmpty(p.Department) && p.User != null && p.User.Role == "Student")
                .GroupBy(p => p.Department)
                .Select(g => new { Department = g.Key, Count = g.Count(), AverageProjects = g.Average(p => p.Projects.Count) })
                .ToListAsync();

            var studentProfiles = await _context.StudentProfiles
                .Include(p => p.User)
                .Include(p => p.Projects)
                .Include(p => p.Certifications)
                .Where(p => p.User != null && p.User.Role == "Student")
                .ToListAsync();

            double completionSum = 0;
            int readyCount = 0;
            foreach (var sp in studentProfiles)
            {
                double score = 0;
                if (!string.IsNullOrEmpty(sp.Bio)) score += 20;
                if (sp.Projects.Count > 0) score += 20;
                if (sp.Projects.Count >= 2) score += 20;
                if (sp.Certifications.Any()) score += 20;
                if (!string.IsNullOrEmpty(sp.GithubUrl)) score += 20;
                completionSum += score;
                if (score >= 70) readyCount++;
            }
            double averageCompletion = totalStudents > 0 ? Math.Round(completionSum / totalStudents, 1) : 0;
            double placementReadiness = totalStudents > 0 ? Math.Round((double)readyCount / totalStudents * 100, 1) : 0;

            return Ok(new
            {
                totalStudents, approvedStudents,
                pendingApprovals = totalStudents - approvedStudents,
                totalProjects, totalResearch, totalCerts, totalCreative,
                totalAchievements, totalCommunity, totalHackathons,
                averageCompletion, placementReadiness, departmentPerformance
            });
        }

        // ──────────── STUDENT MANAGEMENT ────────────
        [HttpGet("students")]
        public async Task<IActionResult> GetStudentsList()
        {
            var students = await _context.StudentProfiles
                .Include(sp => sp.User)
                .Include(sp => sp.Projects)
                .Include(sp => sp.Certifications)
                .Include(sp => sp.ResearchPapers)
                .Include(sp => sp.Hackathons)
                .Include(sp => sp.Achievements)
                .Include(sp => sp.CommunityServices)
                .Include(sp => sp.CreativeWorks)
                .Where(sp => sp.User != null && sp.User.Role == "Student")
                .Select(sp => new
                {
                    sp.Id, sp.UserId,
                    Username = sp.User != null ? sp.User.Username : string.Empty,
                    Email = sp.User != null ? sp.User.Email : string.Empty,
                    Role = sp.User != null ? sp.User.Role : string.Empty,
                    sp.FullName, sp.Department, sp.Approved, sp.Theme, sp.AvatarUrl,
                    ProjectCount = sp.Projects.Count,
                    CertCount = sp.Certifications.Count,
                    ResearchCount = sp.ResearchPapers.Count,
                    HackathonCount = sp.Hackathons.Count,
                    AchievementCount = sp.Achievements.Count,
                    CommunityCount = sp.CommunityServices.Count,
                    CreativeCount = sp.CreativeWorks.Count
                })
                .ToListAsync();
            return Ok(students);
        }

        [HttpPost("approve/{id}")]
        public async Task<IActionResult> ApprovePortfolio(int id, [FromQuery] bool approve = true)
        {
            var profile = await _context.StudentProfiles.FindAsync(id);
            if (profile == null) return NotFound(new { message = "Student profile not found." });
            profile.Approved = approve;
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Portfolio {(approve ? "approved" : "revoked")} successfully." });
        }

        // ──────────── USER & ROLE MANAGEMENT ────────────
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email,
                    u.Role,
                    FullName = _context.StudentProfiles
                        .Where(p => p.UserId == u.Id)
                        .Select(p => p.FullName)
                        .FirstOrDefault() ?? string.Empty
                })
                .ToListAsync();
            return Ok(users);
        }

        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] RoleUpdateDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "User not found." });
            user.Role = dto.Role;
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Role updated to {dto.Role}." });
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "User not found." });
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "User account deleted." });
        }

        // ──────────── INSTITUTION MANAGEMENT ────────────
        [HttpGet("institution")]
        [AllowAnonymous]
        public async Task<IActionResult> GetInstitution()
        {
            var inst = await _context.Institutions.FirstOrDefaultAsync();
            return Ok(inst);
        }

        [HttpPut("institution")]
        public async Task<IActionResult> UpdateInstitution([FromBody] Institution dto)
        {
            var inst = await _context.Institutions.FirstOrDefaultAsync();
            if (inst == null)
            {
                dto.Id = 0;
                _context.Institutions.Add(dto);
            }
            else
            {
                inst.Name = dto.Name;
                inst.ShortName = dto.ShortName;
                inst.LogoUrl = dto.LogoUrl;
                inst.BannerUrl = dto.BannerUrl;
                inst.Address = dto.Address;
                inst.ContactEmail = dto.ContactEmail;
                inst.WebsiteUrl = dto.WebsiteUrl;
            }
            await _context.SaveChangesAsync();
            return Ok(await _context.Institutions.FirstOrDefaultAsync());
        }

        // ──────────── NOTIFICATION MANAGEMENT ────────────
        [HttpGet("notifications")]
        public async Task<IActionResult> GetNotifications()
        {
            var notes = await _context.Notifications
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
            return Ok(notes);
        }

        [HttpPost("notifications")]
        public async Task<IActionResult> AddNotification([FromBody] Notification dto)
        {
            dto.Id = 0;
            dto.CreatedAt = DateTime.UtcNow;
            dto.IsActive = true;
            _context.Notifications.Add(dto);
            await _context.SaveChangesAsync();
            return Ok(dto);
        }

        [HttpPut("notifications/{id}/toggle")]
        public async Task<IActionResult> ToggleNotification(int id)
        {
            var note = await _context.Notifications.FindAsync(id);
            if (note == null) return NotFound();
            note.IsActive = !note.IsActive;
            await _context.SaveChangesAsync();
            return Ok(note);
        }

        [HttpDelete("notifications/{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var note = await _context.Notifications.FindAsync(id);
            if (note == null) return NotFound();
            _context.Notifications.Remove(note);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Notification deleted." });
        }

        // ──────────── THEME MANAGEMENT ────────────
        [HttpGet("themes")]
        public async Task<IActionResult> GetThemes()
        {
            return Ok(await _context.ThemeConfigs.ToListAsync());
        }

        [HttpPut("themes/{id}/toggle")]
        public async Task<IActionResult> ToggleTheme(int id)
        {
            var theme = await _context.ThemeConfigs.FindAsync(id);
            if (theme == null) return NotFound();
            theme.IsEnabled = !theme.IsEnabled;
            await _context.SaveChangesAsync();
            return Ok(theme);
        }

        // ──────────── CSV EXPORT ────────────
        [HttpGet("export/csv")]
        public async Task<IActionResult> ExportStudentsCSV()
        {
            var students = await _context.StudentProfiles
                .Include(sp => sp.User)
                .Include(sp => sp.Projects)
                .Include(sp => sp.Certifications)
                .Include(sp => sp.ResearchPapers)
                .Include(sp => sp.Hackathons)
                .Include(sp => sp.Achievements)
                .Include(sp => sp.CommunityServices)
                .Include(sp => sp.CreativeWorks)
                .Where(sp => sp.User != null && sp.User.Role == "Student")
                .ToListAsync();

            var sb = new StringBuilder();
            sb.AppendLine("Username,Full Name,Email,Department,Theme,Approved,Projects,Certifications,Research Papers,Hackathons,Activities,Community Services,Creative Works,GitHub URL,Behance URL");
            foreach (var s in students)
            {
                sb.AppendLine($"\"{s.User?.Username}\",\"{s.FullName}\",\"{s.User?.Email}\",\"{s.Department}\",\"{s.Theme}\",{s.Approved},{s.Projects.Count},{s.Certifications.Count},{s.ResearchPapers.Count},{s.Hackathons.Count},{s.Achievements.Count},{s.CommunityServices.Count},{s.CreativeWorks.Count},\"{s.GithubUrl}\",\"{s.BehanceUrl}\"");
            }
            var bytes = Encoding.UTF8.GetBytes(sb.ToString());
            return File(bytes, "text/csv", $"mcc_students_{DateTime.Now:yyyyMMdd}.csv");
        }

        // ──────────── DTOs ────────────
        public class RoleUpdateDto
        {
            public string Role { get; set; } = "Student";
        }
    }
}
