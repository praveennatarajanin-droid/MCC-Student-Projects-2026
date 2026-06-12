using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MCC.Portfolio.API.Data;
using MCC.Portfolio.API.Models;

namespace MCC.Portfolio.API.Controllers
{
    [Authorize(Roles = "Admin,PlacementCoordinator,ResearchCoordinator,InnovationCoordinator,StudentAffairsCoordinator")]
    [ApiController]
    [Route("api/[controller]")]
    public class CoordinatorController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CoordinatorController(AppDbContext context)
        {
            _context = context;
        }

        private double CalculateCompletionRate(Student s)
        {
            double rate = 0;
            if (!string.IsNullOrEmpty(s.AvatarUrl)) rate += 15;
            if (!string.IsNullOrEmpty(s.Bio)) rate += 15;
            if (s.Portfolio != null && !string.IsNullOrEmpty(s.Portfolio.StatementOfPurpose)) rate += 20;
            if (!string.IsNullOrEmpty(s.GithubUsername)) rate += 10;
            if (s.Projects.Any()) rate += 15;
            if (s.Certifications.Any()) rate += 15;
            if (s.Achievements.Any() || s.CommunityServices.Any()) rate += 10;
            return rate;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalStudents = await _context.Students.CountAsync();
            var totalDrives = await _context.PlacementDrives.CountAsync();
            var totalPublications = await _context.Publications.CountAsync();
            var totalIdeas = await _context.StartupIdeas.CountAsync();
            var totalCirculars = await _context.CampusCirculars.CountAsync();

            return Ok(new
            {
                TotalStudents = totalStudents,
                TotalPlacementDrives = totalDrives,
                TotalPublications = totalPublications,
                TotalStartupIdeas = totalIdeas,
                TotalCirculars = totalCirculars
            });
        }

        [HttpGet("analytics")]
        public async Task<IActionResult> GetAnalytics()
        {
            var totalStudents = await _context.Students.CountAsync();
            var totalProjects = await _context.Projects.CountAsync();
            var totalPublications = await _context.Publications.CountAsync();
            var totalCertifications = await _context.Certifications.CountAsync();
            var totalStartupIdeas = await _context.StartupIdeas.CountAsync();
            var totalAchievements = await _context.Achievements.CountAsync();
            var totalCommunityServices = await _context.CommunityServices.CountAsync();

            var studentsList = await _context.Students
                .Include(s => s.Portfolio)
                .Include(s => s.Projects)
                .Include(s => s.Certifications)
                .Include(s => s.Publications)
                .Include(s => s.Achievements)
                .Include(s => s.CommunityServices)
                .ToListAsync();

            // Calculate overall completion
            double overallCompletionSum = 0;
            int bracket0to25 = 0;
            int bracket26to50 = 0;
            int bracket51to75 = 0;
            int bracket76to100 = 0;

            int placementReadyCount = 0;
            int cgpaAbove9 = 0;
            int cgpa8to9 = 0;
            int cgpa7to8 = 0;
            int cgpaBelow7 = 0;

            int linkedGithubCount = 0;
            int linkedBehanceCount = 0;

            var skillCounts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

            foreach (var s in studentsList)
            {
                var completion = CalculateCompletionRate(s);
                overallCompletionSum += completion;

                // Portfolio Completion Brackets
                if (completion <= 25) bracket0to25++;
                else if (completion <= 50) bracket26to50++;
                else if (completion <= 75) bracket51to75++;
                else bracket76to100++;

                // Placement Readiness (CGPA >= 8.0 AND Portfolio Completion >= 80)
                if (completion >= 80 && s.Cgpa >= 8.0)
                {
                    placementReadyCount++;
                }

                // CGPA Brackets
                if (s.Cgpa >= 9.0) cgpaAbove9++;
                else if (s.Cgpa >= 8.0) cgpa8to9++;
                else if (s.Cgpa >= 7.0) cgpa7to8++;
                else cgpaBelow7++;

                // Social Integrations
                if (!string.IsNullOrEmpty(s.GithubUsername)) linkedGithubCount++;
                if (!string.IsNullOrEmpty(s.BehanceUsername)) linkedBehanceCount++;

                // Skill Extraction
                foreach (var proj in s.Projects)
                {
                    if (!string.IsNullOrEmpty(proj.TechnologiesUsed))
                    {
                        var techs = proj.TechnologiesUsed.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
                        foreach (var t in techs)
                        {
                            var cleanTech = t.Trim();
                            if (!string.IsNullOrEmpty(cleanTech))
                            {
                                if (skillCounts.ContainsKey(cleanTech))
                                    skillCounts[cleanTech]++;
                                else
                                    skillCounts[cleanTech] = 1;
                            }
                        }
                    }
                }
            }

            double averageCompletion = totalStudents > 0 ? (overallCompletionSum / totalStudents) : 0;
            double placementReadinessRate = totalStudents > 0 ? ((double)placementReadyCount / totalStudents) * 100 : 0;
            double avgCgpaOverall = totalStudents > 0 ? studentsList.Average(s => s.Cgpa) : 0;
            int alumniPlacedCount = studentsList.Count(s => s.IsAlumni && !string.IsNullOrEmpty(s.CurrentCompany));

            // Group by department
            var deptStats = studentsList
                .GroupBy(s => s.Department)
                .Select(g => {
                    var list = g.ToList();
                    var count = list.Count;
                    var ready = list.Count(s => CalculateCompletionRate(s) >= 80 && s.Cgpa >= 8.0);
                    
                    // Fetch startup ideas for students in this department
                    var studentIds = list.Select(s => s.Id).ToList();
                    var deptIdeasCount = _context.StartupIdeas.Count(i => studentIds.Contains(i.StudentId));

                    return new
                    {
                        Department = g.Key,
                        StudentCount = count,
                        AverageCgpa = Math.Round(count > 0 ? list.Average(s => s.Cgpa) : 0, 2),
                        TotalPublications = list.Sum(s => s.Publications.Count),
                        AverageCompletionRate = Math.Round(count > 0 ? list.Average(s => CalculateCompletionRate(s)) : 0, 1),
                        PlacementReadyCount = ready,
                        PlacementReadinessRate = Math.Round(count > 0 ? ((double)ready / count) * 100 : 0, 1),
                        TotalProjects = list.Sum(s => s.Projects.Count),
                        TotalCertifications = list.Sum(s => s.Certifications.Count),
                        TotalStartupIdeas = deptIdeasCount
                    };
                })
                .OrderBy(d => d.Department)
                .ToList();

            // Skill Analytics Formatting (Top 15 skills)
            var topSkills = skillCounts
                .OrderByDescending(kv => kv.Value)
                .Take(15)
                .Select(kv => new
                {
                    Skill = kv.Key,
                    Count = kv.Value,
                    Percentage = Math.Round(totalStudents > 0 ? ((double)kv.Value / totalStudents) * 100 : 0, 1)
                })
                .ToList();

            // Research Activity details
            var publicationsByDept = studentsList
                .GroupBy(s => s.Department)
                .Select(g => new
                {
                    Department = g.Key,
                    Count = g.Sum(s => s.Publications.Count)
                })
                .OrderByDescending(x => x.Count)
                .ToList();

            // Portfolios public vs private count
            var publicPortfolios = await _context.Portfolios.CountAsync(p => p.IsPublic);
            var privatePortfolios = await _context.Portfolios.CountAsync(p => !p.IsPublic);

            var totalEngagementActivities = totalProjects + totalCertifications + totalPublications + totalStartupIdeas + totalAchievements + totalCommunityServices;

            var result = new
            {
                TotalStudents = totalStudents,
                TotalProjects = totalProjects,
                TotalPublications = totalPublications,
                TotalCertifications = totalCertifications,
                TotalStartupIdeas = totalStartupIdeas,
                TotalAchievements = totalAchievements,
                TotalCommunityServices = totalCommunityServices,
                AverageCompletionRate = Math.Round(averageCompletion, 1),

                // 1. Portfolio Completion
                PortfolioCompletion = new
                {
                    AverageCompletionRate = Math.Round(averageCompletion, 1),
                    Bracket0to25 = bracket0to25,
                    Bracket26to50 = bracket26to50,
                    Bracket51to75 = bracket51to75,
                    Bracket76to100 = bracket76to100
                },

                // 2. Department Performance
                DepartmentPerformance = deptStats,

                // 3. Skill Analytics
                SkillAnalytics = topSkills,

                // 4. Research Activity
                ResearchActivity = new
                {
                    TotalPublications = totalPublications,
                    AveragePublicationsPerStudent = Math.Round(totalStudents > 0 ? ((double)totalPublications / totalStudents) : 0, 2),
                    PublicationsByDepartment = publicationsByDept
                },

                // 5. Placement Readiness Metrics
                PlacementReadiness = new
                {
                    TotalPlacementReady = placementReadyCount,
                    PlacementReadinessRate = Math.Round(placementReadinessRate, 1),
                    AverageCgpa = Math.Round(avgCgpaOverall, 2),
                    AlumniPlacedCount = alumniPlacedCount,
                    CgpaBrackets = new
                    {
                        CgpaAbove9 = cgpaAbove9,
                        Cgpa8to9 = cgpa8to9,
                        Cgpa7to8 = cgpa7to8,
                        CgpaBelow7 = cgpaBelow7
                    }
                },

                // 6. Student Engagement Analytics
                StudentEngagement = new
                {
                    PublicPortfoliosCount = publicPortfolios,
                    PrivatePortfoliosCount = privatePortfolios,
                    LinkedGithubRate = Math.Round(totalStudents > 0 ? ((double)linkedGithubCount / totalStudents) * 100 : 0, 1),
                    LinkedBehanceRate = Math.Round(totalStudents > 0 ? ((double)linkedBehanceCount / totalStudents) * 100 : 0, 1),
                    AverageProjectsPerStudent = Math.Round(totalStudents > 0 ? ((double)totalProjects / totalStudents) : 0, 1),
                    AverageCertificationsPerStudent = Math.Round(totalStudents > 0 ? ((double)totalCertifications / totalStudents) : 0, 1),
                    TotalEngagementActivities = totalEngagementActivities
                }
            };

            return Ok(result);
        }

        // --- PLACEMENT CELL ENDPOINTS ---
        [HttpGet("placement/students")]
        public async Task<IActionResult> GetPlacementStudents([FromQuery] string? department, [FromQuery] double? minCgpa)
        {
            var query = _context.Students
                .Include(s => s.Portfolio)
                .Include(s => s.Projects)
                .Include(s => s.Certifications)
                .Include(s => s.Publications)
                .Include(s => s.Achievements)
                .Include(s => s.CommunityServices)
                .AsQueryable();

            if (!string.IsNullOrEmpty(department) && department != "All")
            {
                query = query.Where(s => s.Department == department);
            }

            if (minCgpa.HasValue)
            {
                query = query.Where(s => s.Cgpa >= minCgpa.Value);
            }

            var students = await query.ToListAsync();

            var result = students.Select(s => new
            {
                s.Id,
                s.FirstName,
                s.LastName,
                s.RollNumber,
                s.Department,
                s.Cgpa,
                s.GithubUsername,
                s.BehanceUsername,
                s.IsAlumni,
                s.CurrentCompany,
                s.CurrentRole,
                CompletionRate = CalculateCompletionRate(s),
                ProjectsCount = s.Projects.Count,
                CertificationsCount = s.Certifications.Count,
                PublicationsCount = s.Publications.Count,
                ActivityCount = s.Achievements.Count + s.CommunityServices.Count
            }).ToList();

            return Ok(result);
        }

        [HttpGet("placement/drives")]
        public async Task<IActionResult> GetPlacementDrives()
        {
            var drives = await _context.PlacementDrives
                .OrderByDescending(d => d.DriveDate)
                .Select(d => new
                {
                    d.Id,
                    d.Title,
                    d.Description,
                    d.CompanyName,
                    d.EligibilityCgpa,
                    d.DriveDate,
                    d.ApplicationLink,
                    d.CreatedAt,
                    ApplicantCount = _context.JobApplications.Count(ja => ja.PlacementDriveId == d.Id)
                })
                .ToListAsync();
            return Ok(drives);
        }

        [HttpGet("placement/drives/{driveId}/applicants")]
        public async Task<IActionResult> GetPlacementDriveApplicants(Guid driveId)
        {
            var applications = await _context.JobApplications
                .Include(ja => ja.Student)
                .ThenInclude(s => s.Portfolio)
                .Include(ja => ja.Student)
                .ThenInclude(s => s.Projects)
                .Include(ja => ja.Student)
                .ThenInclude(s => s.Certifications)
                .Include(ja => ja.Student)
                .ThenInclude(s => s.Publications)
                .Include(ja => ja.Student)
                .ThenInclude(s => s.Achievements)
                .Include(ja => ja.Student)
                .ThenInclude(s => s.CommunityServices)
                .Where(ja => ja.PlacementDriveId == driveId)
                .OrderByDescending(ja => ja.AppliedAt)
                .ToListAsync();

            var result = applications.Select(ja => new
            {
                ApplicationId = ja.Id,
                ja.Status,
                ja.Remarks,
                ja.AppliedAt,
                Student = new
                {
                    ja.Student.Id,
                    ja.Student.FirstName,
                    ja.Student.LastName,
                    ja.Student.RollNumber,
                    ja.Student.Department,
                    ja.Student.Cgpa,
                    CompletenessRate = CalculateCompletionRate(ja.Student),
                    Slug = ja.Student.Portfolio?.Slug
                }
            }).ToList();

            return Ok(result);
        }

        public class UpdateApplicationStatusDto
        {
            public string Status { get; set; } = string.Empty;
            public string Remarks { get; set; } = string.Empty;
        }

        [HttpPut("placement/applications/{applicationId}/status")]
        public async Task<IActionResult> UpdateApplicationStatus(Guid applicationId, [FromBody] UpdateApplicationStatusDto dto)
        {
            if (dto == null || string.IsNullOrEmpty(dto.Status))
            {
                return BadRequest("Status field is required.");
            }

            var application = await _context.JobApplications
                .Include(ja => ja.PlacementDrive)
                .Include(ja => ja.Student)
                .SingleOrDefaultAsync(ja => ja.Id == applicationId);

            if (application == null)
            {
                return NotFound("Application not found.");
            }

            application.Status = dto.Status;
            application.Remarks = dto.Remarks ?? string.Empty;

            // Create notification for the student
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                StudentId = application.StudentId,
                Title = $"Application Status Update: {application.PlacementDrive.CompanyName}",
                Message = $"Your application status for '{application.PlacementDrive.Title}' has been updated to '{dto.Status}' by the Placement Cell. Remarks: {dto.Remarks}",
                IsRead = false,
                Type = "Placement",
                Link = "/dashboard/student",
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Application status updated to '{dto.Status}'." });
        }

        [HttpPost("placement/drives")]
        public async Task<IActionResult> CreatePlacementDrive([FromBody] PlacementDrive drive)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            drive.Id = Guid.NewGuid();
            drive.CreatedAt = DateTime.UtcNow;

            _context.PlacementDrives.Add(drive);

            // Create in-app notifications for eligible students
            var eligibleStudents = await _context.Students
                .Where(s => s.Cgpa >= drive.EligibilityCgpa)
                .ToListAsync();

            foreach (var student in eligibleStudents)
            {
                _context.Notifications.Add(new Notification
                {
                    Id = Guid.NewGuid(),
                    StudentId = student.Id,
                    Title = $"New Placement Drive: {drive.CompanyName}",
                    Message = $"A new placement drive has been posted: '{drive.Title}'. Drive date: {drive.DriveDate:MMM dd, yyyy}. Link: {drive.ApplicationLink}",
                    Type = "Placement",
                    Link = "/dashboard/student",
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();

            return Ok(drive);
        }

        [HttpDelete("placement/drives/{id}")]
        public async Task<IActionResult> DeletePlacementDrive(Guid id)
        {
            var drive = await _context.PlacementDrives.FindAsync(id);
            if (drive == null) return NotFound("Placement drive not found.");

            _context.PlacementDrives.Remove(drive);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Placement drive deleted successfully." });
        }

        // --- RESEARCH CELL ENDPOINTS ---
        [HttpGet("research/publications")]
        public async Task<IActionResult> GetResearchPublications([FromQuery] string? department)
        {
            var query = _context.Publications
                .Include(p => p.Student)
                .AsQueryable();

            if (!string.IsNullOrEmpty(department) && department != "All")
            {
                query = query.Where(p => p.Student.Department == department);
            }

            var publications = await query
                .OrderByDescending(p => p.PublishDate)
                .Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.JournalOrConference,
                    p.PublishDate,
                    p.PaperUrl,
                    p.Abstract,
                    p.Authors,
                    Student = new
                    {
                        p.Student.Id,
                        p.Student.FirstName,
                        p.Student.LastName,
                        p.Student.Department,
                        p.Student.RollNumber
                    }
                })
                .ToListAsync();

            return Ok(publications);
        }

        [HttpGet("research/conferences")]
        public async Task<IActionResult> GetResearchConferences([FromQuery] string? department)
        {
            var query = _context.ConferencePresentations
                .Include(c => c.Student)
                .AsQueryable();

            if (!string.IsNullOrEmpty(department) && department != "All")
            {
                query = query.Where(c => c.Student.Department == department);
            }

            var conferences = await query
                .OrderByDescending(c => c.PresentationDate)
                .Select(c => new
                {
                    c.Id,
                    c.Title,
                    c.ConferenceName,
                    c.Role,
                    c.Location,
                    c.PresentationDate,
                    c.AbstractUrl,
                    c.CertificateUrl,
                    c.IsVerified,
                    c.VerificationRemarks,
                    c.VerifiedBy,
                    Student = new
                    {
                        c.Student.Id,
                        c.Student.FirstName,
                        c.Student.LastName,
                        c.Student.Department,
                        c.Student.RollNumber
                    }
                })
                .ToListAsync();

            return Ok(conferences);
        }

        [HttpPut("research/conferences/{id}/verify")]
        public async Task<IActionResult> VerifyConference(Guid id, [FromBody] VerificationDto dto)
        {
            var conf = await _context.ConferencePresentations.Include(c => c.Student).SingleOrDefaultAsync(c => c.Id == id);
            if (conf == null) return NotFound("Conference presentation not found.");

            var verifier = User.FindFirst(ClaimTypes.Email)?.Value ?? "Research Coordinator";
            conf.IsVerified = dto.IsVerified;
            conf.VerificationRemarks = dto.Remarks ?? string.Empty;
            conf.VerifiedBy = verifier;

            // In-app notification to student
            _context.Notifications.Add(new Notification
            {
                Id = Guid.NewGuid(),
                StudentId = conf.StudentId,
                Title = dto.IsVerified ? "Conference Presentation Verified!" : "Conference Presentation Verification Rejected",
                Message = dto.IsVerified 
                    ? $"Your conference presentation '{conf.Title}' was verified by the Research Cell."
                    : $"Verification for your conference presentation '{conf.Title}' was rejected. Feedback: {dto.Remarks}",
                Type = "System",
                Link = "/dashboard/student",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Conference presentation status updated successfully." });
        }

        // --- INNOVATION & ENTREPRENEURSHIP CELL ENDPOINTS ---
        [HttpGet("innovation/ideas")]
        public async Task<IActionResult> GetStartupIdeas()
        {
            var ideas = await _context.StartupIdeas
                .Include(i => i.Student)
                .OrderByDescending(i => i.CreatedAt)
                .Select(i => new
                {
                    i.Id,
                    i.Title,
                    i.Description,
                    i.TeamMembers,
                    i.Stage,
                    i.Status,
                    i.CreatedAt,
                    Student = new
                    {
                        i.Student.Id,
                        i.Student.FirstName,
                        i.Student.LastName,
                        i.Student.Department,
                        i.Student.RollNumber
                    }
                })
                .ToListAsync();

            return Ok(ideas);
        }

        [HttpPut("innovation/ideas/{id}/status")]
        public async Task<IActionResult> UpdateStartupIdeaStatus(Guid id, [FromBody] Dictionary<string, string> body)
        {
            if (body == null || !body.ContainsKey("status"))
            {
                return BadRequest("Status field is required.");
            }

            var idea = await _context.StartupIdeas.FindAsync(id);
            if (idea == null) return NotFound("Startup idea not found.");

            idea.Status = body["status"];

            // Create in-app notification for the student
            _context.Notifications.Add(new Notification
            {
                Id = Guid.NewGuid(),
                StudentId = idea.StudentId,
                Title = "Startup Pitch Status Updated",
                Message = $"Your startup prototype pitch '{idea.Title}' status has been updated to: '{idea.Status}'.",
                Type = "StartupIdea",
                Link = "/dashboard/student",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Startup idea status updated to {idea.Status}." });
        }

        [HttpGet("innovation/science-fairs")]
        public async Task<IActionResult> GetInnovationScienceFairs()
        {
            var fairs = await _context.ScienceFairEntries
                .Include(sf => sf.Student)
                .OrderByDescending(sf => sf.FairDate)
                .Select(sf => new
                {
                    sf.Id,
                    sf.FairName,
                    sf.ProjectTitle,
                    sf.Description,
                    sf.Level,
                    sf.AwardReceived,
                    sf.FairDate,
                    sf.CertificateUrl,
                    sf.IsVerified,
                    sf.VerificationRemarks,
                    sf.VerifiedBy,
                    Student = new
                    {
                        sf.Student.Id,
                        sf.Student.FirstName,
                        sf.Student.LastName,
                        sf.Student.Department,
                        sf.Student.RollNumber
                    }
                })
                .ToListAsync();

            return Ok(fairs);
        }

        [HttpPut("innovation/science-fairs/{id}/verify")]
        public async Task<IActionResult> VerifyScienceFair(Guid id, [FromBody] VerificationDto dto)
        {
            var fair = await _context.ScienceFairEntries.Include(sf => sf.Student).SingleOrDefaultAsync(sf => sf.Id == id);
            if (fair == null) return NotFound("Science fair entry not found.");

            var verifier = User.FindFirst(ClaimTypes.Email)?.Value ?? "Innovation Coordinator";
            fair.IsVerified = dto.IsVerified;
            fair.VerificationRemarks = dto.Remarks ?? string.Empty;
            fair.VerifiedBy = verifier;

            // In-app notification to student
            _context.Notifications.Add(new Notification
            {
                Id = Guid.NewGuid(),
                StudentId = fair.StudentId,
                Title = dto.IsVerified ? "Science Fair Entry Verified!" : "Science Fair Entry Verification Rejected",
                Message = dto.IsVerified 
                    ? $"Your science fair entry for '{fair.ProjectTitle}' was verified by the Innovation Cell."
                    : $"Verification for your science fair entry '{fair.ProjectTitle}' was rejected. Feedback: {dto.Remarks}",
                Type = "System",
                Link = "/dashboard/student",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Science fair entry status updated successfully." });
        }

        // --- GENERAL BULLETIN / CIRCULAR ANNOUNCEMENTS ---
        [HttpGet("circulars")]
        public async Task<IActionResult> GetCirculars()
        {
            var circulars = await _context.CampusCirculars
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
            return Ok(circulars);
        }

        [HttpPost("circulars")]
        public async Task<IActionResult> CreateCircular([FromBody] CampusCircular circular)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var roleClaim = User.FindFirst(ClaimTypes.Role) ?? User.FindFirst("role");
            var senderRole = roleClaim?.Value ?? "Admin";

            circular.Id = Guid.NewGuid();
            circular.SenderRole = senderRole;
            circular.CreatedAt = DateTime.UtcNow;

            _context.CampusCirculars.Add(circular);

            // Broadcast in-app notification to all students
            var allStudents = await _context.Students.ToListAsync();
            foreach (var student in allStudents)
            {
                _context.Notifications.Add(new Notification
                {
                    Id = Guid.NewGuid(),
                    StudentId = student.Id,
                    Title = $"New Campus Circular",
                    Message = $"A new circular has been published: '{circular.Title}'.",
                    Type = "Circular",
                    Link = "/dashboard/student",
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();

            return Ok(circular);
        }

        // --- STUDENT AFFAIRS CELL ENDPOINTS ---
        [HttpGet("studentaffairs/achievements")]
        public async Task<IActionResult> GetStudentAffairsAchievements()
        {
            var achievements = await _context.Achievements
                .Include(a => a.Student)
                .OrderByDescending(a => a.DateEarned)
                .Select(a => new {
                    a.Id,
                    a.Title,
                    a.Description,
                    a.DateEarned,
                    a.Category,
                    a.CertificateUrl,
                    a.IsVerified,
                    a.VerificationRemarks,
                    a.VerifiedBy,
                    Student = new {
                        a.Student.Id,
                        a.Student.FirstName,
                        a.Student.LastName,
                        a.Student.RollNumber,
                        a.Student.Department
                    }
                })
                .ToListAsync();
            return Ok(achievements);
        }

        [HttpGet("studentaffairs/community-services")]
        public async Task<IActionResult> GetStudentAffairsCommunityServices()
        {
            var cs = await _context.CommunityServices
                .Include(c => c.Student)
                .OrderByDescending(c => c.StartDate)
                .Select(c => new {
                    c.Id,
                    c.Organization,
                    c.Role,
                    c.Description,
                    c.StartDate,
                    c.EndDate,
                    c.IsVerified,
                    c.VerificationRemarks,
                    c.VerifiedBy,
                    Student = new {
                        c.Student.Id,
                        c.Student.FirstName,
                        c.Student.LastName,
                        c.Student.RollNumber,
                        c.Student.Department
                    }
                })
                .ToListAsync();
            return Ok(cs);
        }

        public class VerificationDto
        {
            public bool IsVerified { get; set; }
            public string Remarks { get; set; } = string.Empty;
        }

        [HttpPut("studentaffairs/achievements/{id}/verify")]
        public async Task<IActionResult> VerifyAchievement(Guid id, [FromBody] VerificationDto dto)
        {
            var ach = await _context.Achievements.Include(a => a.Student).SingleOrDefaultAsync(a => a.Id == id);
            if (ach == null) return NotFound("Achievement not found.");

            var verifier = User.FindFirst(ClaimTypes.Email)?.Value ?? "Student Affairs";
            ach.IsVerified = dto.IsVerified;
            ach.VerificationRemarks = dto.Remarks ?? string.Empty;
            ach.VerifiedBy = verifier;

            // In-app notification to student
            _context.Notifications.Add(new Notification
            {
                Id = Guid.NewGuid(),
                StudentId = ach.StudentId,
                Title = dto.IsVerified ? "Achievement Verified!" : "Achievement Verification Rejected",
                Message = dto.IsVerified 
                    ? $"Your achievement '{ach.Title}' was verified by the Student Affairs Cell."
                    : $"Verification for your achievement '{ach.Title}' was rejected. Feedback: {dto.Remarks}",
                Type = "System",
                Link = "/dashboard/student",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Achievement status updated successfully." });
        }

        [HttpPut("studentaffairs/community-services/{id}/verify")]
        public async Task<IActionResult> VerifyCommunityService(Guid id, [FromBody] VerificationDto dto)
        {
            var cs = await _context.CommunityServices.Include(c => c.Student).SingleOrDefaultAsync(c => c.Id == id);
            if (cs == null) return NotFound("Community service not found.");

            var verifier = User.FindFirst(ClaimTypes.Email)?.Value ?? "Student Affairs";
            cs.IsVerified = dto.IsVerified;
            cs.VerificationRemarks = dto.Remarks ?? string.Empty;
            cs.VerifiedBy = verifier;

            // In-app notification to student
            _context.Notifications.Add(new Notification
            {
                Id = Guid.NewGuid(),
                StudentId = cs.StudentId,
                Title = dto.IsVerified ? "Community Service Verified!" : "Community Service Verification Rejected",
                Message = dto.IsVerified 
                    ? $"Your community service record at '{cs.Organization}' was verified by the Student Affairs Cell."
                    : $"Verification for your community service record at '{cs.Organization}' was rejected. Feedback: {dto.Remarks}",
                Type = "System",
                Link = "/dashboard/student",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Community service status updated successfully." });
        }
    }
}
