using System;
using System.Linq;
using System.Security.Claims;
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
    [Authorize]
    public class PortfolioController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PortfolioController(AppDbContext context)
        {
            _context = context;
        }

        // PostgreSQL/Npgsql requires DateTimeKind.Utc.
        // Dates from the frontend JSON arrive as DateTimeKind.Unspecified — this normalises them.
        private static DateTime ToUtc(DateTime dt) =>
            dt.Kind == DateTimeKind.Utc ? dt : DateTime.SpecifyKind(dt, DateTimeKind.Utc);

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) throw new UnauthorizedAccessException("User ID claim not found.");
            return int.Parse(userIdClaim.Value);
        }

        private async Task<StudentProfile?> GetCurrentStudentProfileAsync()
        {
            var userId = GetCurrentUserId();
            return await _context.StudentProfiles
                .Include(sp => sp.Projects)
                .Include(sp => sp.Certifications)
                .Include(sp => sp.ResearchPapers)
                .Include(sp => sp.Achievements)
                .Include(sp => sp.Hackathons)
                .Include(sp => sp.CommunityServices)
                .Include(sp => sp.CreativeWorks)
                .FirstOrDefaultAsync(sp => sp.UserId == userId);
        }

        // ================= GET PROFILE =================
        [HttpGet("me")]
        public async Task<IActionResult> GetMyPortfolio()
        {
            var profile = await GetCurrentStudentProfileAsync();
            if (profile == null)
                return NotFound(new { message = "Student profile not found." });
            return Ok(profile);
        }

        [HttpGet("public/{username}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicPortfolio(string username)
        {
            var profile = await _context.StudentProfiles
                .Include(sp => sp.User)
                .Include(sp => sp.Projects)
                .Include(sp => sp.Certifications)
                .Include(sp => sp.ResearchPapers)
                .Include(sp => sp.Achievements)
                .Include(sp => sp.Hackathons)
                .Include(sp => sp.CommunityServices)
                .Include(sp => sp.CreativeWorks)
                .FirstOrDefaultAsync(sp => sp.User != null && sp.User.Username.ToLower() == username.ToLower());

            if (profile == null)
                return NotFound(new { message = "Portfolio not found." });

            return Ok(profile);
        }

        // ================= DELETE OWN ACCOUNT =================
        [HttpDelete("me")]
        public async Task<IActionResult> DeleteMyAccount()
        {
            var userId = GetCurrentUserId();
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            // Cascade delete will remove StudentProfile + all nested items
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Account and all portfolio data permanently deleted." });
        }

        // ================= UPDATE PROFILE =================
        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfile([FromBody] StudentProfile updateDto)
        {
            var profile = await GetCurrentStudentProfileAsync();
            if (profile == null)
                return NotFound(new { message = "Student profile not found." });

            profile.FullName  = updateDto.FullName;
            profile.Bio       = updateDto.Bio;
            profile.SOP       = updateDto.SOP;
            profile.Theme     = updateDto.Theme;
            profile.Department = updateDto.Department;
            profile.BannerUrl  = updateDto.BannerUrl;
            profile.AvatarUrl  = updateDto.AvatarUrl;
            profile.GithubUrl  = updateDto.GithubUrl;
            profile.BehanceUrl = updateDto.BehanceUrl;

            await _context.SaveChangesAsync();
            return Ok(profile);
        }

        // ================= PROJECT CRUD =================
        [HttpPost("projects")]
        public async Task<IActionResult> AddProject([FromBody] Project project)
        {
            var profile = await GetCurrentStudentProfileAsync();
            if (profile == null) return NotFound(new { message = "Profile not found." });

            project.ProfileId = profile.Id;
            project.Id = 0;
            _context.Projects.Add(project);
            await _context.SaveChangesAsync();
            return Ok(project);
        }

        [HttpPut("projects/{id}")]
        public async Task<IActionResult> UpdateProject(int id, [FromBody] Project dto)
        {
            var profile = await GetCurrentStudentProfileAsync();
            if (profile == null) return NotFound();

            var project = profile.Projects.FirstOrDefault(p => p.Id == id);
            if (project == null) return NotFound(new { message = "Project not found or access denied." });

            project.Title       = dto.Title;
            project.Description = dto.Description;
            project.TechStack   = dto.TechStack;
            project.GithubUrl   = dto.GithubUrl;
            project.DemoUrl     = dto.DemoUrl;

            await _context.SaveChangesAsync();
            return Ok(project);
        }

        [HttpDelete("projects/{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var profile = await GetCurrentStudentProfileAsync();
            if (profile == null) return NotFound();

            var project = profile.Projects.FirstOrDefault(p => p.Id == id);
            if (project == null) return NotFound();

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Project deleted successfully." });
        }

        // ================= CERTIFICATION CRUD =================
        [HttpPost("certifications")]
        public async Task<IActionResult> AddCertification([FromBody] Certification cert)
        {
            var profile = await GetCurrentStudentProfileAsync();
            if (profile == null) return NotFound();

            cert.ProfileId = profile.Id;
            cert.Id        = 0;
            cert.IssueDate = ToUtc(cert.IssueDate);
            _context.Certifications.Add(cert);
            await _context.SaveChangesAsync();
            return Ok(cert);
        }

        [HttpPut("certifications/{id}")]
        public async Task<IActionResult> UpdateCertification(int id, [FromBody] Certification dto)
        {
            var profile = await GetCurrentStudentProfileAsync();
            if (profile == null) return NotFound();

            var cert = profile.Certifications.FirstOrDefault(c => c.Id == id);
            if (cert == null) return NotFound();

            cert.Name          = dto.Name;
            cert.Issuer        = dto.Issuer;
            cert.IssueDate     = ToUtc(dto.IssueDate);
            cert.CredentialUrl = dto.CredentialUrl;

            await _context.SaveChangesAsync();
            return Ok(cert);
        }

        [HttpDelete("certifications/{id}")]
        public async Task<IActionResult> DeleteCertification(int id)
        {
            var profile = await GetCurrentStudentProfileAsync();
            if (profile == null) return NotFound();

            var cert = profile.Certifications.FirstOrDefault(c => c.Id == id);
            if (cert == null) return NotFound();

            _context.Certifications.Remove(cert);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Certification deleted." });
        }

        // ================= RESEARCH PAPER CRUD =================
        [HttpPost("research")]
        public async Task<IActionResult> AddResearch([FromBody] ResearchPaper paper)
        {
            var profile = await GetCurrentStudentProfileAsync();
            if (profile == null) return NotFound();

            paper.ProfileId   = profile.Id;
            paper.Id          = 0;
            paper.PublishDate = ToUtc(paper.PublishDate);
            _context.ResearchPapers.Add(paper);
            await _context.SaveChangesAsync();
            return Ok(paper);
        }

        [HttpPut("research/{id}")]
        public async Task<IActionResult> UpdateResearch(int id, [FromBody] ResearchPaper dto)
        {
            var profile = await GetCurrentStudentProfileAsync();
            if (profile == null) return NotFound();

            var paper = profile.ResearchPapers.FirstOrDefault(p => p.Id == id);
            if (paper == null) return NotFound();

            paper.Title       = dto.Title;
            paper.JournalName = dto.JournalName;
            paper.PublishDate = ToUtc(dto.PublishDate);
            paper.Abstract    = dto.Abstract;
            paper.PaperUrl    = dto.PaperUrl;

            await _context.SaveChangesAsync();
            return Ok(paper);
        }

        [HttpDelete("research/{id}")]
        public async Task<IActionResult> DeleteResearch(int id)
        {
            var profile = await GetCurrentStudentProfileAsync();
            if (profile == null) return NotFound();

            var paper = profile.ResearchPapers.FirstOrDefault(p => p.Id == id);
            if (paper == null) return NotFound();

            _context.ResearchPapers.Remove(paper);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Research paper deleted." });
        }

        // ================= ACHIEVEMENT CRUD =================
        [HttpPost("achievements")]
        public async Task<IActionResult> AddAchievement([FromBody] Achievement achievement)
        {
            var profile = await GetCurrentStudentProfileAsync();
            if (profile == null) return NotFound();

            achievement.ProfileId = profile.Id;
            achievement.Id        = 0;
            achievement.Date      = ToUtc(achievement.Date);
            _context.Achievements.Add(achievement);
            await _context.SaveChangesAsync();
            return Ok(achievement);
        }

        [HttpPut("achievements/{id}")]
        public async Task<IActionResult> UpdateAchievement(int id, [FromBody] Achievement dto)
        {
            var profile = await GetCurrentStudentProfileAsync();
            if (profile == null) return NotFound();

            var achievement = profile.Achievements.FirstOrDefault(a => a.Id == id);
            if (achievement == null) return NotFound();

            achievement.Title       = dto.Title;
            achievement.Description = dto.Description;
            achievement.Date        = ToUtc(dto.Date);

            await _context.SaveChangesAsync();
            return Ok(achievement);
        }

        [HttpDelete("achievements/{id}")]
        public async Task<IActionResult> DeleteAchievement(int id)
        {
            var profile = await GetCurrentStudentProfileAsync();
            if (profile == null) return NotFound();

            var achievement = profile.Achievements.FirstOrDefault(a => a.Id == id);
            if (achievement == null) return NotFound();

            _context.Achievements.Remove(achievement);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Achievement deleted." });
        }

        // ================= HACKATHON CRUD =================
        [HttpPost("hackathons")]
        public async Task<IActionResult> AddHackathon([FromBody] Hackathon hack)
        {
            var profile = await GetCurrentStudentProfileAsync();
            if (profile == null) return NotFound();

            hack.ProfileId = profile.Id;
            hack.Id        = 0;
            hack.Date      = ToUtc(hack.Date);
            _context.Hackathons.Add(hack);
            await _context.SaveChangesAsync();
            return Ok(hack);
        }

        [HttpPut("hackathons/{id}")]
        public async Task<IActionResult> UpdateHackathon(int id, [FromBody] Hackathon dto)
        {
            var profile = await GetCurrentStudentProfileAsync();
            if (profile == null) return NotFound();

            var hack = profile.Hackathons.FirstOrDefault(h => h.Id == id);
            if (hack == null) return NotFound();

            hack.EventName   = dto.EventName;
            hack.ProjectName = dto.ProjectName;
            hack.PrizeWon    = dto.PrizeWon;
            hack.Date        = ToUtc(dto.Date);

            await _context.SaveChangesAsync();
            return Ok(hack);
        }

        [HttpDelete("hackathons/{id}")]
        public async Task<IActionResult> DeleteHackathon(int id)
        {
            var profile = await GetCurrentStudentProfileAsync();
            if (profile == null) return NotFound();

            var hack = profile.Hackathons.FirstOrDefault(h => h.Id == id);
            if (hack == null) return NotFound();

            _context.Hackathons.Remove(hack);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Hackathon deleted." });
        }

        // ================= COMMUNITY SERVICE CRUD =================
        [HttpPost("communityservice")]
        public async Task<IActionResult> AddCommunityService([FromBody] CommunityService cs)
        {
            var profile = await GetCurrentStudentProfileAsync();
            if (profile == null) return NotFound();

            cs.ProfileId = profile.Id;
            cs.Id        = 0;
            cs.Date      = ToUtc(cs.Date);
            _context.CommunityServices.Add(cs);
            await _context.SaveChangesAsync();
            return Ok(cs);
        }

        [HttpPut("communityservice/{id}")]
        public async Task<IActionResult> UpdateCommunityService(int id, [FromBody] CommunityService dto)
        {
            var profile = await GetCurrentStudentProfileAsync();
            if (profile == null) return NotFound();

            var cs = profile.CommunityServices.FirstOrDefault(c => c.Id == id);
            if (cs == null) return NotFound();

            cs.Organization = dto.Organization;
            cs.Role         = dto.Role;
            cs.Description  = dto.Description;
            cs.Date         = ToUtc(dto.Date);

            await _context.SaveChangesAsync();
            return Ok(cs);
        }

        [HttpDelete("communityservice/{id}")]
        public async Task<IActionResult> DeleteCommunityService(int id)
        {
            var profile = await GetCurrentStudentProfileAsync();
            if (profile == null) return NotFound();

            var cs = profile.CommunityServices.FirstOrDefault(c => c.Id == id);
            if (cs == null) return NotFound();

            _context.CommunityServices.Remove(cs);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Community service deleted." });
        }

        // ================= CREATIVE WORKS CRUD =================
        [HttpPost("creative")]
        public async Task<IActionResult> AddCreativeWork([FromBody] CreativeWork cw)
        {
            var profile = await GetCurrentStudentProfileAsync();
            if (profile == null) return NotFound();

            cw.ProfileId = profile.Id;
            cw.Id        = 0;
            cw.Date      = ToUtc(cw.Date);
            _context.CreativeWorks.Add(cw);
            await _context.SaveChangesAsync();
            return Ok(cw);
        }

        [HttpPut("creative/{id}")]
        public async Task<IActionResult> UpdateCreativeWork(int id, [FromBody] CreativeWork dto)
        {
            var profile = await GetCurrentStudentProfileAsync();
            if (profile == null) return NotFound();

            var cw = profile.CreativeWorks.FirstOrDefault(c => c.Id == id);
            if (cw == null) return NotFound();

            cw.Title      = dto.Title;
            cw.Description = dto.Description;
            cw.ImageUrl   = dto.ImageUrl;
            cw.ProjectUrl = dto.ProjectUrl;
            cw.Date       = ToUtc(dto.Date);

            await _context.SaveChangesAsync();
            return Ok(cw);
        }

        [HttpDelete("creative/{id}")]
        public async Task<IActionResult> DeleteCreativeWork(int id)
        {
            var profile = await GetCurrentStudentProfileAsync();
            if (profile == null) return NotFound();

            var cw = profile.CreativeWorks.FirstOrDefault(c => c.Id == id);
            if (cw == null) return NotFound();

            _context.CreativeWorks.Remove(cw);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Creative work deleted." });
        }

        // ================= PUBLIC ENDPOINTS =================
        [HttpGet("notifications")]
        [AllowAnonymous]
        public async Task<IActionResult> GetActiveNotifications()
        {
            var notifications = await _context.Notifications
                .Where(n => n.IsActive)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
            return Ok(notifications);
        }

        [HttpGet("institution")]
        [AllowAnonymous]
        public async Task<IActionResult> GetInstitution()
        {
            var institution = await _context.Institutions.FirstOrDefaultAsync();
            return Ok(institution);
        }

        [HttpGet("themes")]
        [AllowAnonymous]
        public async Task<IActionResult> GetThemes()
        {
            var themes = await _context.ThemeConfigs.ToListAsync();
            return Ok(themes);
        }
    }
}
