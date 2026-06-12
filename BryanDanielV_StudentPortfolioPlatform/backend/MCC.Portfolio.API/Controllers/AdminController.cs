using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MCC.Portfolio.API.Data;
using MCC.Portfolio.API.Models;

namespace MCC.Portfolio.API.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
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

        [HttpGet("portfolios")]
        public async Task<IActionResult> GetAllPortfolios()
        {
            var portfolios = await _context.Portfolios
                .Include(p => p.Student)
                .OrderBy(p => p.Slug)
                .Select(p => new
                {
                    PortfolioId = p.Id,
                    p.Slug,
                    p.IsPublic,
                    p.IsApproved,
                    p.ReviewRemarks,
                    p.ReviewedBy,
                    p.StatementOfPurpose,
                    Student = new
                    {
                        p.Student.Id,
                        p.Student.FirstName,
                        p.Student.LastName,
                        p.Student.RollNumber,
                        p.Student.Department,
                        p.Student.Bio
                    }
                })
                .ToListAsync();

            return Ok(portfolios);
        }

        [HttpPut("portfolios/{id}/approve")]
        public async Task<IActionResult> ApprovePortfolio(Guid id, [FromBody] System.Text.Json.JsonElement element)
        {
            var portfolio = await _context.Portfolios.SingleOrDefaultAsync(p => p.Id == id);
            if (portfolio == null)
            {
                return NotFound("Portfolio config not found.");
            }

            bool isApproved = false;
            string? remarks = null;

            // Handle both legacy raw boolean and new object with comments
            if (element.ValueKind == System.Text.Json.JsonValueKind.True || element.ValueKind == System.Text.Json.JsonValueKind.False)
            {
                isApproved = element.GetBoolean();
            }
            else if (element.ValueKind == System.Text.Json.JsonValueKind.Object)
            {
                if (element.TryGetProperty("isApproved", out var isApprovedProp) || element.TryGetProperty("IsApproved", out isApprovedProp))
                {
                    isApproved = isApprovedProp.GetBoolean();
                }
                if (element.TryGetProperty("reviewRemarks", out var remarksProp) || element.TryGetProperty("ReviewRemarks", out remarksProp))
                {
                    remarks = remarksProp.GetString();
                }
            }
            else
            {
                return BadRequest("Invalid request payload.");
            }

            portfolio.IsApproved = isApproved;
            portfolio.ReviewRemarks = remarks;
            portfolio.ReviewedBy = "System Admin";
            await _context.SaveChangesAsync();

            // Dispatch notification to student regarding approval decision
            var student = await _context.Students.FindAsync(portfolio.StudentId);
            if (student != null)
            {
                var notification = new Notification
                {
                    Id = Guid.NewGuid(),
                    StudentId = student.Id,
                    Title = isApproved ? "Portfolio Approved!" : "Portfolio Revision Requested",
                    Message = isApproved 
                        ? "Your professional student portfolio has been approved by the administration and is now live."
                        : $"The administration requested changes to your portfolio: {remarks}",
                    Type = "System",
                    Link = "/dashboard/student",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = $"Portfolio {(isApproved ? "approved" : "unapproved")} successfully." });
        }

        [HttpDelete("students/{id}")]
        public async Task<IActionResult> DeleteStudent(Guid id)
        {
            var student = await _context.Students
                .Include(s => s.User)
                .SingleOrDefaultAsync(s => s.Id == id);

            if (student == null)
            {
                return NotFound("Student profile not found.");
            }

            // Remove associated User record which cascade deletes the student details
            _context.Users.Remove(student.User);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Student registry deleted successfully." });
        }

        // --- USER ACCOUNT & ROLE MANAGEMENT ENDPOINTS ---
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Include(u => u.Student)
                .OrderBy(u => u.Email)
                .Select(u => new
                {
                    u.Id,
                    u.Email,
                    u.Role,
                    u.CreatedAt,
                    Student = u.Student != null ? new
                    {
                        u.Student.Id,
                        u.Student.FirstName,
                        u.Student.LastName,
                        u.Student.RollNumber,
                        u.Student.Department
                    } : null
                })
                .ToListAsync();

            return Ok(users);
        }

        public class RoleUpdateDto
        {
            public string Role { get; set; } = string.Empty;
        }

        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] RoleUpdateDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("User account not found.");

            var validRoles = new[] { "Student", "Admin", "PlacementCoordinator", "ResearchCoordinator", "InnovationCoordinator", "StudentAffairsCoordinator" };
            if (!validRoles.Contains(dto.Role))
            {
                return BadRequest("Invalid role assignment specified.");
            }

            user.Role = dto.Role;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"User role updated to {user.Role} successfully." });
        }

        public class CreateCoordinatorDto
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string Role { get; set; } = string.Empty;
        }

        [HttpPost("coordinators")]
        public async Task<IActionResult> CreateCoordinator([FromBody] CreateCoordinatorDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
            {
                return BadRequest("Email is already registered.");
            }

            var validRoles = new[] { "Admin", "PlacementCoordinator", "ResearchCoordinator", "InnovationCoordinator", "StudentAffairsCoordinator" };
            if (!validRoles.Contains(dto.Role))
            {
                return BadRequest("Invalid coordinator role specified.");
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = dto.Email.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { id = user.Id, email = user.Email, role = user.Role });
        }

        // --- NEW ENHANCED ADMIN MODULE ENDPOINTS ---

        public class GlobalConfigDto
        {
            public string InstitutionName { get; set; } = string.Empty;
            public string EstablishedYear { get; set; } = string.Empty;
            public string AcademicYear { get; set; } = string.Empty;
            public string Vision { get; set; } = string.Empty;
            public string Mission { get; set; } = string.Empty;
            public string PrimaryColor { get; set; } = string.Empty;
            public string SecondaryColor { get; set; } = string.Empty;
            public string DefaultTheme { get; set; } = string.Empty;
            public List<string> EnabledThemes { get; set; } = new();
        }

        [HttpGet("config")]
        [AllowAnonymous]
        public async Task<IActionResult> GetConfig()
        {
            var path = Path.Combine(AppContext.BaseDirectory, "Data", "global_config.json");
            if (!System.IO.File.Exists(path))
            {
                path = Path.Combine(Directory.GetCurrentDirectory(), "Data", "global_config.json");
            }

            if (!System.IO.File.Exists(path))
            {
                return Ok(new GlobalConfigDto
                {
                    InstitutionName = "Madras Christian College",
                    EstablishedYear = "1837",
                    AcademicYear = "2025/2026",
                    Vision = "To provide education of the highest quality to all, especially the underprivileged.",
                    Mission = "To nurture excellence, academic competence and social responsibility.",
                    PrimaryColor = "#722F37",
                    SecondaryColor = "#D4AF37",
                    DefaultTheme = "academic",
                    EnabledThemes = new List<string> { "academic", "corporate", "futuristic", "startup", "creative" }
                });
            }

            try
            {
                var content = await System.IO.File.ReadAllTextAsync(path);
                var config = System.Text.Json.JsonSerializer.Deserialize<GlobalConfigDto>(content, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                return Ok(config);
            }
            catch (Exception ex)
            {
                return BadRequest("Failed to read settings config: " + ex.Message);
            }
        }

        [HttpPut("config")]
        public async Task<IActionResult> UpdateConfig([FromBody] GlobalConfigDto dto)
        {
            var path = Path.Combine(AppContext.BaseDirectory, "Data", "global_config.json");
            if (!System.IO.Directory.Exists(Path.GetDirectoryName(path)))
            {
                path = Path.Combine(Directory.GetCurrentDirectory(), "Data", "global_config.json");
            }
            var dir = Path.GetDirectoryName(path);
            if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }

            try
            {
                var options = new System.Text.Json.JsonSerializerOptions { WriteIndented = true };
                var content = System.Text.Json.JsonSerializer.Serialize(dto, options);
                await System.IO.File.WriteAllTextAsync(path, content);
                return Ok(new { message = "Institutional settings saved successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest("Failed to write settings config: " + ex.Message);
            }
        }

        public class CreateStudentDto
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string RollNumber { get; set; } = string.Empty;
            public string FirstName { get; set; } = string.Empty;
            public string LastName { get; set; } = string.Empty;
            public string Department { get; set; } = string.Empty;
            public string BatchYear { get; set; } = string.Empty;
            public double Cgpa { get; set; } = 0.0;
            public bool IsAlumni { get; set; } = false;
            public string CurrentCompany { get; set; } = string.Empty;
            public string CurrentRole { get; set; } = string.Empty;
            public string Bio { get; set; } = string.Empty;
        }

        [HttpPost("students")]
        public async Task<IActionResult> CreateStudent([FromBody] CreateStudentDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
            {
                return BadRequest("Email address is already in use.");
            }

            if (await _context.Students.AnyAsync(s => s.RollNumber.ToLower() == dto.RollNumber.ToLower()))
            {
                return BadRequest("Roll number is already registered.");
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = dto.Email.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "Student",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var student = new Student
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                RollNumber = dto.RollNumber,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Department = dto.Department,
                BatchYear = dto.BatchYear,
                Cgpa = dto.Cgpa,
                IsAlumni = dto.IsAlumni,
                CurrentCompany = dto.CurrentCompany,
                CurrentRole = dto.CurrentRole,
                Bio = dto.Bio,
                AvatarUrl = ""
            };

            var baseSlug = $"{dto.FirstName.ToLower()}-{dto.LastName.ToLower()}";
            var slug = baseSlug;
            int counter = 1;
            while (await _context.Portfolios.AnyAsync(p => p.Slug == slug))
            {
                slug = $"{baseSlug}-{counter}";
                counter++;
            }

            // Read defaultTheme from global config (falls back to "academic" if missing)
            string defaultTheme = "academic";
            try
            {
                var configPath = Path.Combine(AppContext.BaseDirectory, "Data", "global_config.json");
                if (!System.IO.File.Exists(configPath))
                    configPath = Path.Combine(Directory.GetCurrentDirectory(), "Data", "global_config.json");
                if (System.IO.File.Exists(configPath))
                {
                    var configJson = await System.IO.File.ReadAllTextAsync(configPath);
                    var globalConf = System.Text.Json.JsonSerializer.Deserialize<GlobalConfigDto>(configJson,
                        new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (globalConf != null && !string.IsNullOrEmpty(globalConf.DefaultTheme))
                        defaultTheme = globalConf.DefaultTheme;
                }
            }
            catch { /* keep default */ }

            var portfolio = new Models.Portfolio
            {
                Id = Guid.NewGuid(),
                StudentId = student.Id,
                Slug = slug,
                IsPublic = true,
                IsApproved = false,
                LayoutSettingsJson = $"{{\"theme\":\"{defaultTheme}\",\"visibleSections\":[\"about\",\"projects\",\"publications\",\"certifications\",\"achievements\",\"community\"]}}",
                StatementOfPurpose = "My objective is to contribute to industry applications using my skills in " + dto.Department,
                StoryTitle = "My Student Profile Journey",
                StoryContent = "I am a student at Madras Christian College."
            };

            _context.Users.Add(user);
            _context.Students.Add(student);
            _context.Portfolios.Add(portfolio);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Student registered and initialized successfully.", studentId = student.Id });
        }

        public class UpdateStudentDto
        {
            public string RollNumber { get; set; } = string.Empty;
            public string FirstName { get; set; } = string.Empty;
            public string LastName { get; set; } = string.Empty;
            public string Department { get; set; } = string.Empty;
            public string BatchYear { get; set; } = string.Empty;
            public double Cgpa { get; set; } = 0.0;
            public bool IsAlumni { get; set; } = false;
            public string CurrentCompany { get; set; } = string.Empty;
            public string CurrentRole { get; set; } = string.Empty;
            public string Bio { get; set; } = string.Empty;
        }

        [HttpPut("students/{id}")]
        public async Task<IActionResult> UpdateStudent(Guid id, [FromBody] UpdateStudentDto dto)
        {
            var student = await _context.Students
                .Include(s => s.User)
                .SingleOrDefaultAsync(s => s.Id == id);

            if (student == null) return NotFound("Student profile not found.");

            if (student.RollNumber.ToLower() != dto.RollNumber.ToLower() &&
                await _context.Students.AnyAsync(s => s.RollNumber.ToLower() == dto.RollNumber.ToLower() && s.Id != id))
            {
                return BadRequest("Roll number is already used by another student.");
            }

            student.RollNumber = dto.RollNumber;
            student.FirstName = dto.FirstName;
            student.LastName = dto.LastName;
            student.Department = dto.Department;
            student.BatchYear = dto.BatchYear;
            student.Cgpa = dto.Cgpa;
            student.IsAlumni = dto.IsAlumni;
            student.CurrentCompany = dto.CurrentCompany;
            student.CurrentRole = dto.CurrentRole;
            student.Bio = dto.Bio;

            if (student.User != null)
            {
                student.User.FirstName = dto.FirstName;
                student.User.LastName = dto.LastName;
                student.User.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Student profile updated successfully." });
        }

        public class BroadcastNotificationDto
        {
            public string TargetType { get; set; } = "all";
            public string? DepartmentName { get; set; }
            public string? StudentEmail { get; set; }
            public string Title { get; set; } = string.Empty;
            public string Message { get; set; } = string.Empty;
            public string Type { get; set; } = "System";
            public string Link { get; set; } = string.Empty;
        }

        [HttpPost("notifications")]
        public async Task<IActionResult> SendBroadcast([FromBody] BroadcastNotificationDto dto)
        {
            if (string.IsNullOrEmpty(dto.Title) || string.IsNullOrEmpty(dto.Message))
            {
                return BadRequest("Notification Title and Message are required.");
            }

            List<Student> targetStudents = new();

            if (dto.TargetType.ToLower() == "student")
            {
                if (string.IsNullOrEmpty(dto.StudentEmail))
                {
                    return BadRequest("Student Email is required for individual target.");
                }
                var student = await _context.Students
                    .Include(s => s.User)
                    .FirstOrDefaultAsync(s => s.User.Email.ToLower() == dto.StudentEmail.ToLower());
                
                if (student == null)
                {
                    return NotFound("Student with specified email not found.");
                }
                targetStudents.Add(student);
            }
            else if (dto.TargetType.ToLower() == "department")
            {
                if (string.IsNullOrEmpty(dto.DepartmentName))
                {
                    return BadRequest("Department Name is required for department-wide target.");
                }
                targetStudents = await _context.Students
                    .Where(s => s.Department.ToLower() == dto.DepartmentName.ToLower())
                    .ToListAsync();
            }
            else
            {
                targetStudents = await _context.Students.ToListAsync();
            }

            if (!targetStudents.Any())
            {
                return Ok(new { message = "No matching target students found to deliver notification.", count = 0 });
            }

            var notifications = targetStudents.Select(s => new Notification
            {
                Id = Guid.NewGuid(),
                StudentId = s.Id,
                Title = dto.Title,
                Message = dto.Message,
                Type = dto.Type,
                Link = string.IsNullOrEmpty(dto.Link) ? "/dashboard/student" : dto.Link,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            _context.Notifications.AddRange(notifications);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Notification successfully broadcasted to {notifications.Count} students.", count = notifications.Count });
        }
    }
}
