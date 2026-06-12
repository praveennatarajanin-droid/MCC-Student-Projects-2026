using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MccPortfolio.Api.Data;
using MccPortfolio.Api.Entities;

namespace MccPortfolio.Api.Controllers
{
    [Authorize(Roles = "SuperAdmin,Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        private Guid GetAdminUserId()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdStr, out Guid userId) ? userId : Guid.Empty;
        }

        [HttpGet("students")]
        public async Task<IActionResult> GetStudents()
        {
            var studentsRaw = await _context.StudentProfiles
                .Include(p => p.User)
                .Include(p => p.Department)
                .ToListAsync();

            var students = studentsRaw.Select(p => new
            {
                p.Id,
                UserId = p.UserId,
                Name = p.User!.Name,
                Email = p.User.Email,
                DepartmentName = p.Department!.Name,
                p.UsernameSlug,
                p.IsApproved,
                SkillsCount = string.IsNullOrEmpty(p.Skills) ? 0 : p.Skills.Split(';', StringSplitOptions.RemoveEmptyEntries).Length,
                p.Theme
            }).ToList();

            return Ok(students);
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpDelete("students/{userId}")]
        public async Task<IActionResult> DeleteStudent(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            if (user.Role == "SuperAdmin")
            {
                return BadRequest(new { message = "Cannot delete an administrator account." });
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }

        [HttpGet("approvals")]
        public async Task<IActionResult> GetPendingApprovals()
        {
            var approvals = await _context.PortfolioApprovals
                .Include(a => a.StudentProfile)
                    .ThenInclude(p => p!.User)
                .Include(a => a.StudentProfile)
                    .ThenInclude(p => p!.Department)
                .Where(a => a.Status == "Pending")
                .OrderByDescending(a => a.ReviewedAt)
                .Select(a => new
                {
                    a.Id,
                    a.StudentProfileId,
                    StudentName = a.StudentProfile!.User!.Name,
                    StudentEmail = a.StudentProfile.User.Email,
                    DepartmentName = a.StudentProfile.Department!.Name,
                    a.StudentProfile.UsernameSlug,
                    a.Status,
                    a.Comments,
                    SubmittedAt = a.ReviewedAt
                })
                .ToListAsync();

            return Ok(approvals);
        }

        [HttpPost("approvals/{id}/review")]
        public async Task<IActionResult> ReviewApproval(Guid id, [FromBody] ReviewApprovalRequest request)
        {
            var approval = await _context.PortfolioApprovals
                .Include(a => a.StudentProfile)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (approval == null) return NotFound();

            var adminId = GetAdminUserId();
            approval.Status = request.Status; // "Approved" or "Rejected"
            approval.Comments = request.Comments;
            approval.ReviewedById = adminId;
            approval.ReviewedAt = DateTime.UtcNow;

            if (approval.StudentProfile != null)
            {
                approval.StudentProfile.IsApproved = (request.Status == "Approved");
                
                // Notify the student
                var notification = new Notification
                {
                    UserId = approval.StudentProfile.UserId,
                    Title = request.Status == "Approved" ? "Portfolio Approved! 🎉" : "Portfolio Needs Changes ⚠️",
                    Message = request.Status == "Approved" 
                        ? $"Congratulations! Your portfolio is now officially approved and live at mccportfolio.edu/student/{approval.StudentProfile.UsernameSlug}." 
                        : $"Your portfolio review request was returned: {request.Comments}. Please update your profile and resubmit."
                };
                _context.Notifications.Add(notification);
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        [HttpGet("certifications")]
        public async Task<IActionResult> GetPendingCertifications()
        {
            var certifications = await _context.Certifications
                .Include(c => c.StudentProfile)
                    .ThenInclude(p => p!.User)
                .Include(c => c.StudentProfile)
                    .ThenInclude(p => p!.Department)
                .Where(c => c.Status == "pending")
                .OrderByDescending(c => c.IssueDate)
                .Select(c => new
                {
                    c.Id,
                    c.StudentProfileId,
                    StudentName = c.StudentProfile!.User!.Name,
                    StudentEmail = c.StudentProfile.User.Email,
                    DepartmentName = c.StudentProfile.Department!.Name,
                    c.Name,
                    c.Issuer,
                    c.IssueDate,
                    c.CredentialUrl,
                    c.CredentialId,
                    c.FileUrl,
                    c.Status
                })
                .ToListAsync();

            return Ok(certifications);
        }

        [HttpPost("certifications/{id}/review")]
        public async Task<IActionResult> ReviewCertification(Guid id, [FromBody] ReviewCertificationRequest request)
        {
            var cert = await _context.Certifications
                .Include(c => c.StudentProfile)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (cert == null) return NotFound();

            cert.Status = request.Status;

            if (cert.StudentProfile != null)
            {
                var notification = new Notification
                {
                    UserId = cert.StudentProfile.UserId,
                    Title = request.Status == "verified" ? "Certification Verified! 🏅" : "Certification Rejected ❌",
                    Message = request.Status == "verified"
                        ? $"Your certification for '{cert.Name}' from '{cert.Issuer}' has been verified and awarded the MCC Sealed badge."
                        : $"Your certification for '{cert.Name}' could not be verified. Comments: {request.Comments}"
                };
                _context.Notifications.Add(notification);
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        [HttpGet("analytics")]
        public async Task<IActionResult> GetAnalytics()
        {
            var totalUsers = await _context.Users.CountAsync(u => u.Role == "Student");
            var approvedPortfolios = await _context.StudentProfiles.CountAsync(p => p.IsApproved);
            var pendingApprovals = await _context.PortfolioApprovals.CountAsync(a => a.Status == "Pending");

            // Compute department stats
            var departments = await _context.Departments
                .Include(d => d.StudentProfiles)
                .Select(d => new
                {
                    d.Name,
                    d.Code,
                    StudentCount = d.StudentProfiles.Count,
                    ApprovedCount = d.StudentProfiles.Count(p => p.IsApproved)
                })
                .ToListAsync();

            // Compute skill frequencies
            var skillsRaw = await _context.StudentProfiles
                .Select(p => p.Skills)
                .ToListAsync();

            var skillsMap = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            foreach (var item in skillsRaw)
            {
                if (string.IsNullOrEmpty(item)) continue;
                var splits = item.Split(';', StringSplitOptions.RemoveEmptyEntries);
                foreach (var s in splits)
                {
                    var cleanSkill = s.Trim();
                    if (skillsMap.ContainsKey(cleanSkill))
                        skillsMap[cleanSkill]++;
                    else
                        skillsMap[cleanSkill] = 1;
                }
            }
            var skillCloud = skillsMap.Select(kvp => new { Name = kvp.Key, Count = kvp.Value }).OrderByDescending(x => x.Count).Take(10).ToList();

            // Compute research activity
            var totalPapers = await _context.ResearchPapers.CountAsync();
            var totalInnovation = await _context.ResearchPapers.CountAsync(r => r.IsInnovationProject);

            // Compute placement readiness distribution
            // Low (<50), Medium (50-79), High (80+)
            var profiles = await _context.StudentProfiles
                .Include(p => p.Projects)
                .Include(p => p.Certifications)
                .Include(p => p.ResearchPapers)
                .Include(p => p.CommunityServices)
                .ToListAsync();

            int lowReadiness = 0;
            int medReadiness = 0;
            int highReadiness = 0;

            foreach (var p in profiles)
            {
                int score = 0;
                if (!string.IsNullOrEmpty(p.Bio)) score += 15;
                if (!string.IsNullOrEmpty(p.Skills) && p.Skills.Split(';').Length >= 3) score += 20;
                if (p.Projects.Count >= 2) score += 30;
                if (p.Certifications.Count >= 1) score += 20;
                if (p.ResearchPapers.Count >= 1 || p.CommunityServices.Count >= 1) score += 15;

                if (score >= 80) highReadiness++;
                else if (score >= 50) medReadiness++;
                else lowReadiness++;
            }

            return Ok(new
            {
                TotalStudents = totalUsers,
                ApprovedPortfolios = approvedPortfolios,
                PendingApprovals = pendingApprovals,
                CompletionPercentage = totalUsers == 0 ? 0 : Math.Round((double)approvedPortfolios / totalUsers * 100, 1),
                Departments = departments,
                SkillsCloud = skillCloud,
                Research = new { TotalPapers = totalPapers, InnovationProjects = totalInnovation },
                PlacementReadiness = new
                {
                    High = highReadiness,
                    Medium = medReadiness,
                    Low = lowReadiness
                }
            });
        }

        // ─── DEPARTMENTS ──────────────────────────────────────────────────────────

        [Authorize(Roles = "SuperAdmin")]
        [HttpGet("departments")]
        public async Task<IActionResult> GetDepartments()
        {
            var departmentsRaw = await _context.Departments
                .Include(d => d.StudentProfiles)
                    .ThenInclude(p => p.User)
                .Include(d => d.Institution)
                .ToListAsync();

            var departments = departmentsRaw.Select(d => new
            {
                d.Id,
                d.Name,
                d.Code,
                InstitutionName = d.Institution != null ? d.Institution.Name : "MCC",
                TotalStudents = d.StudentProfiles.Count,
                ApprovedStudents = d.StudentProfiles.Count(p => p.IsApproved),
                TopSkills = d.StudentProfiles
                    .Where(p => !string.IsNullOrEmpty(p.Skills))
                    .SelectMany(p => p.Skills.Split(';', StringSplitOptions.RemoveEmptyEntries))
                    .GroupBy(s => s.Trim())
                    .OrderByDescending(g => g.Count())
                    .Take(5)
                    .Select(g => g.Key)
                    .ToList()
            }).ToList();

            return Ok(departments);
        }

        // ─── INSTITUTION MANAGEMENT ────────────────────────────────────────────
        [Authorize(Roles = "SuperAdmin")]
        [HttpGet("institution")]
        public async Task<IActionResult> GetInstitution()
        {
            var inst = await _context.Institutions.FirstOrDefaultAsync();
            if (inst == null) return NotFound();
            return Ok(inst);
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpPut("institution")]
        public async Task<IActionResult> UpdateInstitution([FromBody] Institution instUpdate)
        {
            var inst = await _context.Institutions.FirstOrDefaultAsync();
            if (inst == null) return NotFound();
            inst.Name = instUpdate.Name;
            inst.Code = instUpdate.Code;
            inst.Address = instUpdate.Address;
            inst.ContactEmail = instUpdate.ContactEmail;
            await _context.SaveChangesAsync();
            return Ok(inst);
        }

        // ─── ROLE MANAGEMENT ──────────────────────────────────────────────────
        [Authorize(Roles = "SuperAdmin")]
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new { u.Id, u.Name, u.Email, u.Role, u.CreatedAt })
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();
            return Ok(users);
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateRoleRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            if (user.Email == "admin@mcc.edu" || user.Role == "SuperAdmin") 
            {
                if (user.Email == "admin@mcc.edu")
                    return BadRequest(new { message = "Cannot modify the primary administrator role." });
            }
            
            var newRole = request.Role.Trim();
            if (newRole != "SuperAdmin" && newRole != "Admin" && newRole != "Student" && newRole != "PendingAdmin")
            {
                return BadRequest(new { message = "Invalid role specified." });
            }
            
            user.Role = newRole;
            await _context.SaveChangesAsync();
            return Ok(user);
        }

        // ─── THEME MANAGEMENT ────────────────────────────────────────────────
        [HttpGet("themes")]
        public async Task<IActionResult> GetThemeStats()
        {
            var statsRaw = await _context.StudentProfiles
                .GroupBy(p => p.Theme)
                .Select(g => new { Theme = g.Key, Count = g.Count() })
                .ToListAsync();
            return Ok(statsRaw);
        }

        // ─── NOTIFICATION MANAGEMENT ─────────────────────────────────────────
        [HttpPost("notifications/broadcast")]
        public async Task<IActionResult> BroadcastNotification([FromBody] BroadcastNotificationRequest request)
        {
            var users = await _context.Users.ToListAsync();
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    UserId = user.Id,
                    Title = request.Title,
                    Message = request.Message,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(notification);
            }
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Successfully broadcasted notification to {users.Count} users." });
        }

        [HttpPost("notifications/user/{userId}")]
        public async Task<IActionResult> SendUserNotification(Guid userId, [FromBody] BroadcastNotificationRequest request)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();
            var notification = new Notification
            {
                UserId = userId,
                Title = request.Title,
                Message = request.Message,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Successfully sent notification to {user.Name}." });
        }

        // ─── ADMIN CONTROL OVER STUDENT MODULES ───────────────────────────────
        [HttpGet("students/{profileId}")]
        public async Task<IActionResult> GetStudentProfileFull(Guid profileId)
        {
            var profile = await _context.StudentProfiles
                .Include(p => p.User)
                .Include(p => p.Department)
                .Include(p => p.Certifications)
                .Include(p => p.ResearchPapers)
                .Include(p => p.Projects)
                .Include(p => p.Achievements)
                .Include(p => p.Hackathons)
                .Include(p => p.CommunityServices)
                .Include(p => p.CreativeWorks)
                .FirstOrDefaultAsync(p => p.Id == profileId);

            if (profile == null) return NotFound(new { message = "Student profile not found." });
            return Ok(profile);
        }

        [HttpPut("students/{profileId}")]
        public async Task<IActionResult> AdminUpdateStudentProfile(Guid profileId, [FromBody] UpdateStudentProfileAdminRequest request)
        {
            var profile = await _context.StudentProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == profileId);

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
            profile.Theme = request.Theme;
            profile.CustomThemeConfig = request.CustomThemeConfig;
            profile.IsApproved = request.IsApproved;

            // Notify student
            var notification = new Notification
            {
                UserId = profile.UserId,
                Title = "Profile Updated by Administrator 🛠️",
                Message = "An administrator has updated elements of your profile details."
            };
            _context.Notifications.Add(notification);

            await _context.SaveChangesAsync();
            return Ok(profile);
        }

        // Projects CRUD
        [HttpPost("students/{profileId}/projects")]
        public async Task<IActionResult> AdminAddProject(Guid profileId, [FromBody] ProjectDto dto)
        {
            var profile = await _context.StudentProfiles.FindAsync(profileId);
            if (profile == null) return NotFound();

            var project = new Project
            {
                StudentProfileId = profileId,
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

        [HttpPut("students/{profileId}/projects/{id}")]
        public async Task<IActionResult> AdminUpdateProject(Guid profileId, Guid id, [FromBody] ProjectDto dto)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id && p.StudentProfileId == profileId);
            if (project == null) return NotFound();

            project.Title = dto.Title;
            project.Description = dto.Description;
            project.GitHubUrl = dto.GitHubUrl;
            project.LiveDemoUrl = dto.LiveDemoUrl;
            project.TechStack = dto.TechStack;

            await _context.SaveChangesAsync();
            return Ok(project);
        }

        [HttpDelete("students/{profileId}/projects/{id}")]
        public async Task<IActionResult> AdminDeleteProject(Guid profileId, Guid id)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id && p.StudentProfileId == profileId);
            if (project == null) return NotFound();

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        // Certifications CRUD
        [HttpPost("students/{profileId}/certifications")]
        public async Task<IActionResult> AdminAddCertification(Guid profileId, [FromBody] CertificationDto dto)
        {
            var profile = await _context.StudentProfiles.FindAsync(profileId);
            if (profile == null) return NotFound();

            var cert = new Certification
            {
                StudentProfileId = profileId,
                Name = dto.Name,
                Issuer = dto.Issuer,
                IssueDate = dto.IssueDate,
                CredentialUrl = dto.CredentialUrl,
                FileUrl = dto.FileUrl,
                CredentialId = dto.CredentialId,
                Status = "verified"
            };
            _context.Certifications.Add(cert);
            await _context.SaveChangesAsync();
            return Ok(cert);
        }

        [HttpPut("students/{profileId}/certifications/{id}")]
        public async Task<IActionResult> AdminUpdateCertification(Guid profileId, Guid id, [FromBody] CertificationDto dto)
        {
            var cert = await _context.Certifications.FirstOrDefaultAsync(c => c.Id == id && c.StudentProfileId == profileId);
            if (cert == null) return NotFound();

            cert.Name = dto.Name;
            cert.Issuer = dto.Issuer;
            cert.IssueDate = dto.IssueDate;
            cert.CredentialUrl = dto.CredentialUrl;
            cert.FileUrl = dto.FileUrl;
            cert.CredentialId = dto.CredentialId;
            cert.Status = "verified";

            await _context.SaveChangesAsync();
            return Ok(cert);
        }

        [HttpDelete("students/{profileId}/certifications/{id}")]
        public async Task<IActionResult> AdminDeleteCertification(Guid profileId, Guid id)
        {
            var cert = await _context.Certifications.FirstOrDefaultAsync(c => c.Id == id && c.StudentProfileId == profileId);
            if (cert == null) return NotFound();

            _context.Certifications.Remove(cert);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        // Research Papers CRUD
        [HttpPost("students/{profileId}/research")]
        public async Task<IActionResult> AdminAddResearch(Guid profileId, [FromBody] ResearchDto dto)
        {
            var profile = await _context.StudentProfiles.FindAsync(profileId);
            if (profile == null) return NotFound();

            var paper = new ResearchPaper
            {
                StudentProfileId = profileId,
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

        [HttpPut("students/{profileId}/research/{id}")]
        public async Task<IActionResult> AdminUpdateResearch(Guid profileId, Guid id, [FromBody] ResearchDto dto)
        {
            var paper = await _context.ResearchPapers.FirstOrDefaultAsync(r => r.Id == id && r.StudentProfileId == profileId);
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

        [HttpDelete("students/{profileId}/research/{id}")]
        public async Task<IActionResult> AdminDeleteResearch(Guid profileId, Guid id)
        {
            var paper = await _context.ResearchPapers.FirstOrDefaultAsync(r => r.Id == id && r.StudentProfileId == profileId);
            if (paper == null) return NotFound();

            _context.ResearchPapers.Remove(paper);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        // Achievements CRUD
        [HttpPost("students/{profileId}/achievements")]
        public async Task<IActionResult> AdminAddAchievement(Guid profileId, [FromBody] AchievementDto dto)
        {
            var profile = await _context.StudentProfiles.FindAsync(profileId);
            if (profile == null) return NotFound();

            var ach = new Achievement
            {
                StudentProfileId = profileId,
                Title = dto.Title,
                Description = dto.Description,
                Date = dto.Date,
                Category = dto.Category
            };
            _context.Achievements.Add(ach);
            await _context.SaveChangesAsync();
            return Ok(ach);
        }

        [HttpPut("students/{profileId}/achievements/{id}")]
        public async Task<IActionResult> AdminUpdateAchievement(Guid profileId, Guid id, [FromBody] AchievementDto dto)
        {
            var ach = await _context.Achievements.FirstOrDefaultAsync(a => a.Id == id && a.StudentProfileId == profileId);
            if (ach == null) return NotFound();

            ach.Title = dto.Title;
            ach.Description = dto.Description;
            ach.Date = dto.Date;
            ach.Category = dto.Category;

            await _context.SaveChangesAsync();
            return Ok(ach);
        }

        [HttpDelete("students/{profileId}/achievements/{id}")]
        public async Task<IActionResult> AdminDeleteAchievement(Guid profileId, Guid id)
        {
            var ach = await _context.Achievements.FirstOrDefaultAsync(a => a.Id == id && a.StudentProfileId == profileId);
            if (ach == null) return NotFound();

            _context.Achievements.Remove(ach);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        // Hackathons CRUD
        [HttpPost("students/{profileId}/hackathons")]
        public async Task<IActionResult> AdminAddHackathon(Guid profileId, [FromBody] HackathonDto dto)
        {
            var profile = await _context.StudentProfiles.FindAsync(profileId);
            if (profile == null) return NotFound();

            var hack = new Hackathon
            {
                StudentProfileId = profileId,
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

        [HttpPut("students/{profileId}/hackathons/{id}")]
        public async Task<IActionResult> AdminUpdateHackathon(Guid profileId, Guid id, [FromBody] HackathonDto dto)
        {
            var hack = await _context.Hackathons.FirstOrDefaultAsync(h => h.Id == id && h.StudentProfileId == profileId);
            if (hack == null) return NotFound();

            hack.Name = dto.Name;
            hack.ProjectName = dto.ProjectName;
            hack.Description = dto.Description;
            hack.AchievementPosition = dto.AchievementPosition;
            hack.Date = dto.Date;

            await _context.SaveChangesAsync();
            return Ok(hack);
        }

        [HttpDelete("students/{profileId}/hackathons/{id}")]
        public async Task<IActionResult> AdminDeleteHackathon(Guid profileId, Guid id)
        {
            var hack = await _context.Hackathons.FirstOrDefaultAsync(h => h.Id == id && h.StudentProfileId == profileId);
            if (hack == null) return NotFound();

            _context.Hackathons.Remove(hack);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        // Community Service CRUD
        [HttpPost("students/{profileId}/community")]
        public async Task<IActionResult> AdminAddCommunity(Guid profileId, [FromBody] CommunityDto dto)
        {
            var profile = await _context.StudentProfiles.FindAsync(profileId);
            if (profile == null) return NotFound();

            var svc = new CommunityService
            {
                StudentProfileId = profileId,
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

        [HttpPut("students/{profileId}/community/{id}")]
        public async Task<IActionResult> AdminUpdateCommunity(Guid profileId, Guid id, [FromBody] CommunityDto dto)
        {
            var svc = await _context.CommunityServices.FirstOrDefaultAsync(c => c.Id == id && c.StudentProfileId == profileId);
            if (svc == null) return NotFound();

            svc.OrganizationName = dto.OrganizationName;
            svc.Activity = dto.Activity;
            svc.HoursServed = dto.HoursServed;
            svc.Description = dto.Description;
            svc.Date = dto.Date;

            await _context.SaveChangesAsync();
            return Ok(svc);
        }

        [HttpDelete("students/{profileId}/community/{id}")]
        public async Task<IActionResult> AdminDeleteCommunity(Guid profileId, Guid id)
        {
            var svc = await _context.CommunityServices.FirstOrDefaultAsync(c => c.Id == id && c.StudentProfileId == profileId);
            if (svc == null) return NotFound();

            _context.CommunityServices.Remove(svc);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        // Creative Works CRUD
        [HttpPost("students/{profileId}/creative")]
        public async Task<IActionResult> AdminAddCreative(Guid profileId, [FromBody] CreativeDto dto)
        {
            var profile = await _context.StudentProfiles.FindAsync(profileId);
            if (profile == null) return NotFound();

            var creative = new CreativeWork
            {
                StudentProfileId = profileId,
                Title = dto.Title,
                Description = dto.Description,
                MediaUrl = dto.MediaUrl,
                BehanceUrl = dto.BehanceUrl
            };
            _context.CreativeWorks.Add(creative);
            await _context.SaveChangesAsync();
            return Ok(creative);
        }

        [HttpPut("students/{profileId}/creative/{id}")]
        public async Task<IActionResult> AdminUpdateCreative(Guid profileId, Guid id, [FromBody] CreativeDto dto)
        {
            var creative = await _context.CreativeWorks.FirstOrDefaultAsync(c => c.Id == id && c.StudentProfileId == profileId);
            if (creative == null) return NotFound();

            creative.Title = dto.Title;
            creative.Description = dto.Description;
            creative.MediaUrl = dto.MediaUrl;
            creative.BehanceUrl = dto.BehanceUrl;

            await _context.SaveChangesAsync();
            return Ok(creative);
        }

        [HttpDelete("students/{profileId}/creative/{id}")]
        public async Task<IActionResult> AdminDeleteCreative(Guid profileId, Guid id)
        {
            var creative = await _context.CreativeWorks.FirstOrDefaultAsync(c => c.Id == id && c.StudentProfileId == profileId);
            if (creative == null) return NotFound();

            _context.CreativeWorks.Remove(creative);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }
    } // end AdminController class

    public class UpdateStudentProfileAdminRequest
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
        public string Theme { get; set; } = "Apple-Minimal";
        public string CustomThemeConfig { get; set; } = "{}";
        public bool IsApproved { get; set; }
    }

    public class ReviewApprovalRequest
    {
        public string Status { get; set; } = "Approved"; // "Approved" or "Rejected"
        public string Comments { get; set; } = string.Empty;
    }

    public class UpdateRoleRequest
    {
        public string Role { get; set; } = "Student";
    }

    public class BroadcastNotificationRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    public class ReviewCertificationRequest
    {
        public string Status { get; set; } = "verified"; // "verified" or "failed"
        public string Comments { get; set; } = string.Empty;
    }
}
