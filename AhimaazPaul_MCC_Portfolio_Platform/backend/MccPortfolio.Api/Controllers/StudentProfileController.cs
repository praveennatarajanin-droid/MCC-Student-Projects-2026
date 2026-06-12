using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MccPortfolio.Api.Data;
using MccPortfolio.Api.Entities;
using MccPortfolio.Api.Services;

namespace MccPortfolio.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class StudentProfileController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IFileStorageService _storageService;

        public StudentProfileController(AppDbContext context, IFileStorageService storageService)
        {
            _context = context;
            _storageService = storageService;
        }

        // Helper to get current user ID
        private Guid GetUserId()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out Guid userId))
            {
                throw new InvalidOperationException("User ID claim not found or invalid.");
            }
            return userId;
        }

        // Helper to get current student profile (returns null if not found)
        private async Task<StudentProfile?> GetStudentProfileAsync()
        {
            var userId = GetUserId();
            return await _context.StudentProfiles
                .Include(p => p.User)
                .Include(p => p.Department)
                .Include(p => p.Certifications)
                .Include(p => p.ResearchPapers)
                .Include(p => p.Projects)
                .Include(p => p.Achievements)
                .Include(p => p.Hackathons)
                .Include(p => p.CommunityServices)
                .Include(p => p.CreativeWorks)
                .FirstOrDefaultAsync(p => p.UserId == userId);
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var profile = await GetStudentProfileAsync();
            if (profile == null)
                return NotFound(new { message = "Student profile not found. Please register a student account." });
            return Ok(profile);
        }

        [HttpPost("update")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var profile = await GetStudentProfileAsync();
            if (profile == null) return NotFound(new { message = "Student profile not found." });
            
            profile.Bio = request.Bio;
            profile.Headline = request.Headline;
            profile.Skills = request.Skills;
            profile.GitHubUrl = request.GitHubUrl;
            profile.LinkedInUrl = request.LinkedInUrl;
            profile.BehanceUrl = request.BehanceUrl;
            profile.PersonalStory = request.PersonalStory;
            profile.StatementOfPurpose = request.StatementOfPurpose;
            profile.AcademicRecordsJson = request.AcademicRecordsJson;
            profile.RegistrationNumber = request.RegistrationNumber;
            profile.ProfilePictureUrl = request.ProfilePictureUrl;

            // When user updates profile details, status becomes pending/needs approval if they modify major elements
            // But we can let them submit manually for validation. Let's keep it as is.
            await _context.SaveChangesAsync();
            return Ok(profile);
        }

        [HttpPost("theme")]
        public async Task<IActionResult> UpdateTheme([FromBody] UpdateThemeRequest request)
        {
            var profile = await GetStudentProfileAsync();
            if (profile == null) return NotFound(new { message = "Student profile not found." });
            profile.Theme = request.Theme;
            profile.CustomThemeConfig = request.CustomThemeConfig;
            
            await _context.SaveChangesAsync();
            return Ok(new { theme = profile.Theme, config = profile.CustomThemeConfig });
        }

        [HttpGet("notifications")]
        public async Task<IActionResult> GetMyNotifications()
        {
            var userId = GetUserId();
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
            return Ok(notifications);
        }

        [HttpPost("notifications/{id}/read")]
        public async Task<IActionResult> MarkNotificationRead(Guid id)
        {
            var userId = GetUserId();
            var notification = await _context.Notifications.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
            if (notification == null) return NotFound();

            notification.IsRead = true;
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        [HttpPost("submit-approval")]
        public async Task<IActionResult> SubmitForApproval()
        {
            var profile = await GetStudentProfileAsync();
            if (profile == null) return NotFound(new { message = "Student profile not found." });
            
            // Check if there is already a pending approval
            var existingPending = await _context.PortfolioApprovals
                .FirstOrDefaultAsync(a => a.StudentProfileId == profile.Id && a.Status == "Pending");

            if (existingPending != null)
            {
                return BadRequest(new { message = "You already have a pending approval request." });
            }

            var approval = new PortfolioApproval
            {
                StudentProfileId = profile.Id,
                Status = "Pending",
                Comments = "Student submitted portfolio for initial review."
            };

            _context.PortfolioApprovals.Add(approval);
            
            // Reset IsApproved until reviewed
            profile.IsApproved = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Portfolio submitted successfully. An administrator will review it shortly." });
        }

        [HttpPost("upload-resume")]
        public async Task<IActionResult> UploadResume(IFormFile file)
        {
            if (file == null) return BadRequest("No file uploaded");
            
            var profile = await GetStudentProfileAsync();
            if (profile == null) return NotFound(new { message = "Student profile not found." });
            var fileUrl = await _storageService.SaveFileAsync(file, "resumes");
            profile.ResumeUrl = fileUrl;
            
            await _context.SaveChangesAsync();
            return Ok(new { fileUrl });
        }

        [HttpPost("remove-resume")]
        public async Task<IActionResult> RemoveResume()
        {
            var profile = await GetStudentProfileAsync();
            if (profile == null) return NotFound(new { message = "Student profile not found." });
            
            profile.ResumeUrl = string.Empty;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Resume removed successfully." });
        }

        [HttpPost("upload-document")]
        public async Task<IActionResult> UploadDocument(IFormFile file, [FromQuery] string type)
        {
            if (file == null) return BadRequest("No file uploaded");
            var fileUrl = await _storageService.SaveFileAsync(file, type ?? "documents");
            return Ok(new { fileUrl });
        }

        // ==========================================
        // PROJECTS CRUD
        // ==========================================

        [HttpPost("projects")]
        public async Task<IActionResult> AddProject([FromBody] ProjectDto dto)
        {
            var profile = await GetStudentProfileAsync();
            var project = new Project
            {
                StudentProfileId = profile.Id,
                Title = dto.Title,
                Description = dto.Description,
                GitHubUrl = dto.GitHubUrl,
                LiveDemoUrl = dto.LiveDemoUrl,
                TechStack = dto.TechStack
            };
            _context.Projects.Add(project);
            await _context.SaveChangesAsync();
            return Ok(project);
        }

        [HttpPut("projects/{id}")]
        public async Task<IActionResult> UpdateProject(Guid id, [FromBody] ProjectDto dto)
        {
            var profile = await GetStudentProfileAsync();
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id && p.StudentProfileId == profile.Id);
            if (project == null) return NotFound();

            project.Title = dto.Title;
            project.Description = dto.Description;
            project.GitHubUrl = dto.GitHubUrl;
            project.LiveDemoUrl = dto.LiveDemoUrl;
            project.TechStack = dto.TechStack;

            await _context.SaveChangesAsync();
            return Ok(project);
        }

        [HttpDelete("projects/{id}")]
        public async Task<IActionResult> DeleteProject(Guid id)
        {
            var profile = await GetStudentProfileAsync();
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id && p.StudentProfileId == profile.Id);
            if (project == null) return NotFound();

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        // ==========================================
        // CERTIFICATIONS CRUD
        // ==========================================

        [HttpPost("certifications")]
        public async Task<IActionResult> AddCertification([FromBody] CertificationDto dto)
        {
            var profile = await GetStudentProfileAsync();
            var cert = new Certification
            {
                StudentProfileId = profile.Id,
                Name = dto.Name,
                Issuer = dto.Issuer,
                IssueDate = dto.IssueDate,
                CredentialUrl = dto.CredentialUrl,
                FileUrl = dto.FileUrl,
                CredentialId = dto.CredentialId,
                Status = "pending"
            };
            _context.Certifications.Add(cert);
            await _context.SaveChangesAsync();
            return Ok(cert);
        }

        [HttpPut("certifications/{id}")]
        public async Task<IActionResult> UpdateCertification(Guid id, [FromBody] CertificationDto dto)
        {
            var profile = await GetStudentProfileAsync();
            var cert = await _context.Certifications.FirstOrDefaultAsync(c => c.Id == id && c.StudentProfileId == profile.Id);
            if (cert == null) return NotFound();

            cert.Name = dto.Name;
            cert.Issuer = dto.Issuer;
            cert.IssueDate = dto.IssueDate;
            cert.CredentialUrl = dto.CredentialUrl;
            cert.FileUrl = dto.FileUrl;
            cert.CredentialId = dto.CredentialId;
            cert.Status = "pending";

            await _context.SaveChangesAsync();
            return Ok(cert);
        }

        [HttpDelete("certifications/{id}")]
        public async Task<IActionResult> DeleteCertification(Guid id)
        {
            var profile = await GetStudentProfileAsync();
            var cert = await _context.Certifications.FirstOrDefaultAsync(c => c.Id == id && c.StudentProfileId == profile.Id);
            if (cert == null) return NotFound();

            _context.Certifications.Remove(cert);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        // ==========================================
        // RESEARCH PAPERS CRUD
        // ==========================================

        [HttpPost("research")]
        public async Task<IActionResult> AddResearch([FromBody] ResearchDto dto)
        {
            var profile = await GetStudentProfileAsync();
            var paper = new ResearchPaper
            {
                StudentProfileId = profile.Id,
                Title = dto.Title,
                Abstract = dto.Abstract,
                JournalOrConference = dto.JournalOrConference,
                PublishDate = dto.PublishDate,
                PaperUrl = dto.PaperUrl,
                IsInnovationProject = dto.IsInnovationProject,
                PrototypeStatus = dto.PrototypeStatus,
                StartupIdeaPitch = dto.StartupIdeaPitch
            };
            _context.ResearchPapers.Add(paper);
            await _context.SaveChangesAsync();
            return Ok(paper);
        }

        [HttpPut("research/{id}")]
        public async Task<IActionResult> UpdateResearch(Guid id, [FromBody] ResearchDto dto)
        {
            var profile = await GetStudentProfileAsync();
            var paper = await _context.ResearchPapers.FirstOrDefaultAsync(r => r.Id == id && r.StudentProfileId == profile.Id);
            if (paper == null) return NotFound();

            paper.Title = dto.Title;
            paper.Abstract = dto.Abstract;
            paper.JournalOrConference = dto.JournalOrConference;
            paper.PublishDate = dto.PublishDate;
            paper.PaperUrl = dto.PaperUrl;
            paper.IsInnovationProject = dto.IsInnovationProject;
            paper.PrototypeStatus = dto.PrototypeStatus;
            paper.StartupIdeaPitch = dto.StartupIdeaPitch;

            await _context.SaveChangesAsync();
            return Ok(paper);
        }

        [HttpDelete("research/{id}")]
        public async Task<IActionResult> DeleteResearch(Guid id)
        {
            var profile = await GetStudentProfileAsync();
            var paper = await _context.ResearchPapers.FirstOrDefaultAsync(r => r.Id == id && r.StudentProfileId == profile.Id);
            if (paper == null) return NotFound();

            _context.ResearchPapers.Remove(paper);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        // ==========================================
        // ACHIEVEMENTS CRUD
        // ==========================================

        [HttpPost("achievements")]
        public async Task<IActionResult> AddAchievement([FromBody] AchievementDto dto)
        {
            var profile = await GetStudentProfileAsync();
            var ach = new Achievement
            {
                StudentProfileId = profile.Id,
                Title = dto.Title,
                Description = dto.Description,
                Date = dto.Date,
                Category = dto.Category
            };
            _context.Achievements.Add(ach);
            await _context.SaveChangesAsync();
            return Ok(ach);
        }

        [HttpPut("achievements/{id}")]
        public async Task<IActionResult> UpdateAchievement(Guid id, [FromBody] AchievementDto dto)
        {
            var profile = await GetStudentProfileAsync();
            var ach = await _context.Achievements.FirstOrDefaultAsync(a => a.Id == id && a.StudentProfileId == profile.Id);
            if (ach == null) return NotFound();

            ach.Title = dto.Title;
            ach.Description = dto.Description;
            ach.Date = dto.Date;
            ach.Category = dto.Category;

            await _context.SaveChangesAsync();
            return Ok(ach);
        }

        [HttpDelete("achievements/{id}")]
        public async Task<IActionResult> DeleteAchievement(Guid id)
        {
            var profile = await GetStudentProfileAsync();
            var ach = await _context.Achievements.FirstOrDefaultAsync(a => a.Id == id && a.StudentProfileId == profile.Id);
            if (ach == null) return NotFound();

            _context.Achievements.Remove(ach);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        // ==========================================
        // HACKATHONS CRUD
        // ==========================================

        [HttpPost("hackathons")]
        public async Task<IActionResult> AddHackathon([FromBody] HackathonDto dto)
        {
            var profile = await GetStudentProfileAsync();
            var hack = new Hackathon
            {
                StudentProfileId = profile.Id,
                Name = dto.Name,
                ProjectName = dto.ProjectName,
                Description = dto.Description,
                AchievementPosition = dto.AchievementPosition,
                Date = dto.Date
            };
            _context.Hackathons.Add(hack);
            await _context.SaveChangesAsync();
            return Ok(hack);
        }

        [HttpPut("hackathons/{id}")]
        public async Task<IActionResult> UpdateHackathon(Guid id, [FromBody] HackathonDto dto)
        {
            var profile = await GetStudentProfileAsync();
            var hack = await _context.Hackathons.FirstOrDefaultAsync(h => h.Id == id && h.StudentProfileId == profile.Id);
            if (hack == null) return NotFound();

            hack.Name = dto.Name;
            hack.ProjectName = dto.ProjectName;
            hack.Description = dto.Description;
            hack.AchievementPosition = dto.AchievementPosition;
            hack.Date = dto.Date;

            await _context.SaveChangesAsync();
            return Ok(hack);
        }

        [HttpDelete("hackathons/{id}")]
        public async Task<IActionResult> DeleteHackathon(Guid id)
        {
            var profile = await GetStudentProfileAsync();
            var hack = await _context.Hackathons.FirstOrDefaultAsync(h => h.Id == id && h.StudentProfileId == profile.Id);
            if (hack == null) return NotFound();

            _context.Hackathons.Remove(hack);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        // ==========================================
        // COMMUNITY SERVICE CRUD
        // ==========================================

        [HttpPost("community")]
        public async Task<IActionResult> AddCommunity([FromBody] CommunityDto dto)
        {
            var profile = await GetStudentProfileAsync();
            var svc = new CommunityService
            {
                StudentProfileId = profile.Id,
                OrganizationName = dto.OrganizationName,
                Activity = dto.Activity,
                HoursServed = dto.HoursServed,
                Description = dto.Description,
                Date = dto.Date
            };
            _context.CommunityServices.Add(svc);
            await _context.SaveChangesAsync();
            return Ok(svc);
        }

        [HttpPut("community/{id}")]
        public async Task<IActionResult> UpdateCommunity(Guid id, [FromBody] CommunityDto dto)
        {
            var profile = await GetStudentProfileAsync();
            var svc = await _context.CommunityServices.FirstOrDefaultAsync(c => c.Id == id && c.StudentProfileId == profile.Id);
            if (svc == null) return NotFound();

            svc.OrganizationName = dto.OrganizationName;
            svc.Activity = dto.Activity;
            svc.HoursServed = dto.HoursServed;
            svc.Description = dto.Description;
            svc.Date = dto.Date;

            await _context.SaveChangesAsync();
            return Ok(svc);
        }

        [HttpDelete("community/{id}")]
        public async Task<IActionResult> DeleteCommunity(Guid id)
        {
            var profile = await GetStudentProfileAsync();
            var svc = await _context.CommunityServices.FirstOrDefaultAsync(c => c.Id == id && c.StudentProfileId == profile.Id);
            if (svc == null) return NotFound();

            _context.CommunityServices.Remove(svc);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        // ==========================================
        // CREATIVE WORKS CRUD
        // ==========================================

        [HttpPost("creative")]
        public async Task<IActionResult> AddCreative([FromBody] CreativeDto dto)
        {
            var profile = await GetStudentProfileAsync();
            var creative = new CreativeWork
            {
                StudentProfileId = profile.Id,
                Title = dto.Title,
                Description = dto.Description,
                MediaUrl = dto.MediaUrl,
                BehanceUrl = dto.BehanceUrl
            };
            _context.CreativeWorks.Add(creative);
            await _context.SaveChangesAsync();
            return Ok(creative);
        }

        [HttpPut("creative/{id}")]
        public async Task<IActionResult> UpdateCreative(Guid id, [FromBody] CreativeDto dto)
        {
            var profile = await GetStudentProfileAsync();
            var creative = await _context.CreativeWorks.FirstOrDefaultAsync(c => c.Id == id && c.StudentProfileId == profile.Id);
            if (creative == null) return NotFound();

            creative.Title = dto.Title;
            creative.Description = dto.Description;
            creative.MediaUrl = dto.MediaUrl;
            creative.BehanceUrl = dto.BehanceUrl;

            await _context.SaveChangesAsync();
            return Ok(creative);
        }

        [HttpDelete("creative/{id}")]
        public async Task<IActionResult> DeleteCreative(Guid id)
        {
            var profile = await GetStudentProfileAsync();
            var creative = await _context.CreativeWorks.FirstOrDefaultAsync(c => c.Id == id && c.StudentProfileId == profile.Id);
            if (creative == null) return NotFound();

            _context.CreativeWorks.Remove(creative);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }
    }

    // DTOs
    public class UpdateProfileRequest
    {
        public string Bio { get; set; } = string.Empty;
        public string Headline { get; set; } = string.Empty;
        public string Skills { get; set; } = string.Empty;
        public string GitHubUrl { get; set; } = string.Empty;
        public string LinkedInUrl { get; set; } = string.Empty;
        public string BehanceUrl { get; set; } = string.Empty;
        public string PersonalStory { get; set; } = string.Empty;
        public string StatementOfPurpose { get; set; } = string.Empty;
        public string AcademicRecordsJson { get; set; } = "[]";
        public string RegistrationNumber { get; set; } = string.Empty;
        public string ProfilePictureUrl { get; set; } = string.Empty;
    }

    public class UpdateThemeRequest
    {
        public string Theme { get; set; } = "Academic";
        public string CustomThemeConfig { get; set; } = "{}";
    }

    public class ProjectDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string GitHubUrl { get; set; } = string.Empty;
        public string LiveDemoUrl { get; set; } = string.Empty;
        public string TechStack { get; set; } = string.Empty;
    }

    public class CertificationDto
    {
        public string Name { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public DateTime? IssueDate { get; set; }
        public string CredentialUrl { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public string CredentialId { get; set; } = string.Empty;
    }

    public class ResearchDto
    {
        public string Title { get; set; } = string.Empty;
        public string Abstract { get; set; } = string.Empty;
        public string JournalOrConference { get; set; } = string.Empty;
        public DateTime? PublishDate { get; set; }
        public string PaperUrl { get; set; } = string.Empty;
        public bool IsInnovationProject { get; set; }
        public string PrototypeStatus { get; set; } = string.Empty;
        public string StartupIdeaPitch { get; set; } = string.Empty;
    }

    public class AchievementDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime? Date { get; set; }
        public string Category { get; set; } = "Academic";
    }

    public class HackathonDto
    {
        public string Name { get; set; } = string.Empty;
        public string ProjectName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string AchievementPosition { get; set; } = string.Empty;
        public DateTime? Date { get; set; }
    }

    public class CommunityDto
    {
        public string OrganizationName { get; set; } = string.Empty;
        public string Activity { get; set; } = string.Empty;
        public int HoursServed { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime? Date { get; set; }
    }

    public class CreativeDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string MediaUrl { get; set; } = string.Empty;
        public string BehanceUrl { get; set; } = string.Empty;
    }
}
