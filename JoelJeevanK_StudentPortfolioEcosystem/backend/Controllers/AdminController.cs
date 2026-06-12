using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MccPortfolioBackend.Data;
using MccPortfolioBackend.Models;
using Microsoft.AspNetCore.Authorization;

namespace MccPortfolioBackend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly MccDbContext _context;
        private readonly IConfiguration _configuration;

        public AdminController(MccDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        private bool IsAdminRequest()
        {
            var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(roleClaim) && Guid.TryParse(userIdClaim, out var userId))
            {
                var user = _context.Users.Find(userId);
                if (user == null || user.IsBlocked) return false;
                return user.Role == "Admin" || user.Role == "Staff";
            }

            if (Request.Headers.TryGetValue("X-User-Id", out var idStr) && Guid.TryParse(idStr.ToString(), out var legacyUserId))
            {
                var user = _context.Users.Find(legacyUserId);
                return user != null && !user.IsBlocked && (user.Role == "Admin" || user.Role == "Staff");
            }
            return false;
        }

        private async Task<string?> GetStaffDepartmentAsync()
        {
            var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (!string.IsNullOrEmpty(roleClaim) && Guid.TryParse(userIdClaim, out var userId))
            {
                if (roleClaim == "Staff")
                {
                    var user = await _context.Users.FindAsync(userId);
                    if (user != null && user.Role == "Staff")
                    {
                        if (user.IsSuperAdmin) return null; // Super Admin sees all departments!
                        return user.Department;
                    }
                }
            }

            if (Request.Headers.TryGetValue("X-User-Id", out var idStr) && Guid.TryParse(idStr.ToString(), out var legacyUserId))
            {
                var user = await _context.Users.FindAsync(legacyUserId);
                if (user != null && user.Role == "Staff")
                {
                    if (user.IsSuperAdmin) return null; // Super Admin sees all departments!
                    return user.Department;
                }
            }
            return null;
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingStudents()
        {
            if (!IsAdminRequest())
                return Unauthorized(new { message = "Only administrators can access this resource." });

            var staffDept = await GetStaffDepartmentAsync();

            var query = _context.Users
                .Include(u => u.Profile)
                .Where(u => u.Role == "Student" && !u.IsApproved);

            if (staffDept != null)
            {
                query = query.Where(u => u.Department == staffDept);
            }

            var pendingStudents = await query
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.Gender,
                    u.Department,
                    u.Username,
                    Bio = u.Profile != null ? u.Profile.Bio : string.Empty,
                    Skills = u.Profile != null ? u.Profile.Skills : string.Empty,
                    ProfileImageUrl = u.Profile != null ? u.Profile.ProfileImageUrl : string.Empty,
                    Phone = u.Profile != null ? u.Profile.Phone : string.Empty,
                    PersonalStory = u.Profile != null ? u.Profile.PersonalStory : string.Empty,
                    Sop = u.Profile != null ? u.Profile.Sop : string.Empty,
                    GitHubUsername = u.Profile != null ? u.Profile.GitHubUsername : string.Empty,
                    AcademicRecordsCount = u.AcademicRecords.Count
                })
                .ToListAsync();

            return Ok(pendingStudents);
        }

        [HttpPost("approve/{userId}")]
        public async Task<IActionResult> ApproveStudent(Guid userId)
        {
            if (!IsAdminRequest())
                return Unauthorized(new { message = "Only administrators can perform this action." });

            var staffDept = await GetStaffDepartmentAsync();
            var student = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.Role == "Student");
            if (student == null)
            {
                return NotFound(new { message = "Student not found" });
            }

            if (staffDept != null && student.Department != staffDept)
            {
                return Unauthorized(new { message = "You can only approve students from your own department." });
            }

            student.IsApproved = true;
            student.UpdatedAt = DateTime.UtcNow;

            var notification = new Notification
            {
                UserId = student.Id,
                Message = "Congratulations! Your student portfolio has been approved by the department staff and is now LIVE.",
                Type = "Success",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Portfolio of {student.Name} approved successfully" });
        }

        [HttpPost("reject/{userId}")]
        public async Task<IActionResult> RejectStudent(Guid userId)
        {
            if (!IsAdminRequest())
                return Unauthorized(new { message = "Only administrators can perform this action." });

            var staffDept = await GetStaffDepartmentAsync();
            var student = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.Role == "Student");
            if (student == null)
            {
                return NotFound(new { message = "Student not found" });
            }

            if (staffDept != null && student.Department != staffDept)
            {
                return Unauthorized(new { message = "You can only reject students from your own department." });
            }

            student.IsApproved = false;
            student.UpdatedAt = DateTime.UtcNow;

            var notification = new Notification
            {
                UserId = student.Id,
                Message = "Your student portfolio has been set to Pending / Review status by department staff. Please ensure your narrative, projects, and credentials are correct.",
                Type = "Warning",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Portfolio of {student.Name} set to pending status" });
        }

        [HttpGet("analytics")]
        public async Task<IActionResult> GetAnalytics()
        {
            if (!IsAdminRequest())
                return Unauthorized(new { message = "Only administrators can access this resource." });

            var staffDept = await GetStaffDepartmentAsync();

            var totalStudentsQuery = _context.Users.Where(u => u.Role == "Student");
            var approvedStudentsQuery = _context.Users.Where(u => u.Role == "Student" && u.IsApproved);

            if (staffDept != null)
            {
                totalStudentsQuery = totalStudentsQuery.Where(u => u.Department == staffDept);
                approvedStudentsQuery = approvedStudentsQuery.Where(u => u.Department == staffDept);
            }

            var totalStudents = await totalStudentsQuery.CountAsync();
            var approvedStudents = await approvedStudentsQuery.CountAsync();
            var pendingStudents = totalStudents - approvedStudents;

            if (totalStudents == 0)
            {
                return Ok(new
                {
                    totalStudents = 0,
                    approvedStudents = 0,
                    pendingStudents = 0,
                    averageCompletionRate = 0.0,
                    completionDistribution = new { low = 0, medium = 0, high = 0 },
                    completionMetrics = new { profiles = 0.0, academics = 0.0, certifications = 0.0, projects = 0.0 },
                    departmentPerformance = new List<object>(),
                    skillAnalytics = new List<object>(),
                    researchActivity = new List<object>(),
                    placementReadiness = new
                    {
                        ready = 0,
                        notReady = 0,
                        readyPercentage = 0.0,
                        details = new { hodApproved = 0, githubLinked = 0, projectVetted = 0, certificationVetted = 0 }
                    },
                    studentEngagement = new
                    {
                        totalActivities = 0,
                        averageChecklistScore = 0.0,
                        recentTimeline = new List<object>()
                    }
                });
            }

            // Load complete student list with joined records for high-fidelity calculations
            var placementBaseQuery = _context.Users.Where(u => u.Role == "Student");
            if (staffDept != null)
            {
                placementBaseQuery = placementBaseQuery.Where(u => u.Department == staffDept);
            }

            var studentsList = await placementBaseQuery
                .Include(s => s.Profile)
                .Include(s => s.Projects)
                .Include(s => s.Certifications)
                .Include(s => s.AcademicRecords)
                .Include(s => s.Activities)
                .Include(s => s.ResearchInnovations)
                .ToListAsync();

            // 1. Portfolio Completion score distribution
            double totalScoreSum = 0;
            int lowBucket = 0;
            int medBucket = 0;
            int highBucket = 0;
            double totalChecklistScoreSum = 0;

            foreach (var student in studentsList)
            {
                int completedItems = 0;
                var profile = student.Profile;
                if (profile != null)
                {
                    if (!string.IsNullOrEmpty(profile.ProfileImageUrl)) completedItems++;
                    if (!string.IsNullOrEmpty(profile.Phone)) completedItems++;
                    if (!string.IsNullOrEmpty(profile.Bio)) completedItems++;
                    if (!string.IsNullOrEmpty(profile.PersonalStory)) completedItems++;
                    if (!string.IsNullOrEmpty(profile.Sop)) completedItems++;
                    if (!string.IsNullOrEmpty(profile.GitHubUsername)) completedItems++;
                    
                    var skillCount = string.IsNullOrEmpty(profile.Skills) ? 0 : profile.Skills.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries).Length;
                    if (skillCount >= 3) completedItems++;
                }
                if (student.AcademicRecords != null && student.AcademicRecords.Any()) completedItems++;

                totalChecklistScoreSum += completedItems;
                double completionPercentage = (completedItems / 8.0) * 100;
                totalScoreSum += completionPercentage;

                if (completionPercentage < 50.0) lowBucket++;
                else if (completionPercentage < 80.0) medBucket++;
                else highBucket++;
            }

            double averageCompletionRate = Math.Round(totalScoreSum / totalStudents, 1);
            double averageChecklistScore = Math.Round(totalChecklistScoreSum / totalStudents, 1);
            var completionDistribution = new { low = lowBucket, medium = medBucket, high = highBucket };

            // Portfolio Completion Metrics
            int studentsWithProfile = studentsList.Count(s => s.Profile != null && !string.IsNullOrEmpty(s.Profile.PersonalStory) && !string.IsNullOrEmpty(s.Profile.Sop));
            int studentsWithAcademics = studentsList.Count(s => s.AcademicRecords != null && s.AcademicRecords.Any());
            int studentsWithCerts = studentsList.Count(s => s.Certifications != null && s.Certifications.Any());
            int studentsWithProjects = studentsList.Count(s => s.Projects != null && s.Projects.Any());

            var completionMetrics = new
            {
                profiles = Math.Round((double)studentsWithProfile / totalStudents * 100, 1),
                academics = Math.Round((double)studentsWithAcademics / totalStudents * 100, 1),
                certifications = Math.Round((double)studentsWithCerts / totalStudents * 100, 1),
                projects = Math.Round((double)studentsWithProjects / totalStudents * 100, 1)
            };

            // 2. Department Summaries with average completion score
            var departmentGroups = studentsList
                .GroupBy(u => u.Department)
                .Select(g => new
                {
                    Department = g.Key,
                    StudentCount = g.Count(),
                    ApprovedCount = g.Count(u => u.IsApproved),
                    ProjectsCount = g.Sum(u => u.Projects?.Count ?? 0),
                    CertificationsCount = g.Sum(u => u.Certifications?.Count ?? 0),
                    ResearchCount = g.Sum(u => u.ResearchInnovations?.Count ?? 0)
                })
                .ToList();

            var departmentPerformance = departmentGroups.Select(dg => {
                var deptStudents = studentsList.Where(s => s.Department == dg.Department).ToList();
                double deptSum = 0;
                foreach (var ds in deptStudents)
                {
                    int items = 0;
                    if (ds.Profile != null)
                    {
                        if (!string.IsNullOrEmpty(ds.Profile.ProfileImageUrl)) items++;
                        if (!string.IsNullOrEmpty(ds.Profile.Phone)) items++;
                        if (!string.IsNullOrEmpty(ds.Profile.Bio)) items++;
                        if (!string.IsNullOrEmpty(ds.Profile.PersonalStory)) items++;
                        if (!string.IsNullOrEmpty(ds.Profile.Sop)) items++;
                        if (!string.IsNullOrEmpty(ds.Profile.GitHubUsername)) items++;
                        
                        var skillCount = string.IsNullOrEmpty(ds.Profile.Skills) ? 0 : ds.Profile.Skills.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries).Length;
                        if (skillCount >= 3) items++;
                    }
                    if (ds.AcademicRecords != null && ds.AcademicRecords.Any()) items++;
                    deptSum += (items / 8.0) * 100;
                }
                double avgDeptCompletion = dg.StudentCount > 0 ? Math.Round(deptSum / dg.StudentCount, 1) : 0.0;

                return new
                {
                    dg.Department,
                    dg.StudentCount,
                    dg.ApprovedCount,
                    dg.ProjectsCount,
                    dg.CertificationsCount,
                    dg.ResearchCount,
                    AverageProjects = dg.StudentCount > 0 ? Math.Round((double)dg.ProjectsCount / dg.StudentCount, 1) : 0,
                    AverageCertifications = dg.StudentCount > 0 ? Math.Round((double)dg.CertificationsCount / dg.StudentCount, 1) : 0,
                    AverageResearch = dg.StudentCount > 0 ? Math.Round((double)dg.ResearchCount / dg.StudentCount, 1) : 0,
                    AverageCompletion = avgDeptCompletion
                };
            }).ToList();

            // 3. Skill Analytics Aggregation (Parsing CSV list from Profiles)
            var skillCounts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            foreach (var student in studentsList)
            {
                var profile = student.Profile;
                if (profile != null && !string.IsNullOrEmpty(profile.Skills))
                {
                    var skillsArray = profile.Skills.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
                    foreach (var s in skillsArray)
                    {
                        var trimmed = s.Trim();
                        if (!string.IsNullOrEmpty(trimmed))
                        {
                            if (skillCounts.ContainsKey(trimmed)) skillCounts[trimmed]++;
                            else skillCounts[trimmed] = 1;
                        }
                    }
                }
            }

            var skillAnalytics = skillCounts
                .OrderByDescending(kv => kv.Value)
                .Take(10)
                .Select(kv => new { Skill = kv.Key, Count = kv.Value })
                .ToList();

            // 4. Research breakdown counts
            var researchCounts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
            {
                { "ResearchPaper", 0 },
                { "InnovationProject", 0 },
                { "Prototype", 0 },
                { "ConferencePresentation", 0 },
                { "ScienceFair", 0 },
                { "StartupIdea", 0 }
            };

            foreach (var student in studentsList)
            {
                if (student.ResearchInnovations != null)
                {
                    foreach (var ri in student.ResearchInnovations)
                    {
                        if (researchCounts.ContainsKey(ri.Type))
                        {
                            researchCounts[ri.Type]++;
                        }
                        else
                        {
                            researchCounts[ri.Type] = 1;
                        }
                    }
                }
            }

            var researchActivity = researchCounts.Select(kv => new { Type = kv.Key, Count = kv.Value }).ToList();

            // 5. Placement Vetting readiness breakdown
            int totalReady = 0;
            int totalNotReady = 0;
            int totalHODApproved = 0;
            int totalGithubLinked = 0;
            int totalProjectVetted = 0;
            int totalCertificationVetted = 0;

            foreach (var student in studentsList)
            {
                bool isApproved = student.IsApproved;
                bool hasProjects = student.Projects != null && student.Projects.Any();
                bool hasCerts = student.Certifications != null && student.Certifications.Any();
                bool hasGithub = student.Profile != null && !string.IsNullOrEmpty(student.Profile.GitHubUsername);

                if (isApproved) totalHODApproved++;
                if (hasGithub) totalGithubLinked++;
                if (hasProjects) totalProjectVetted++;
                if (hasCerts) totalCertificationVetted++;

                if (isApproved && hasProjects && hasCerts)
                {
                    totalReady++;
                }
                else
                {
                    totalNotReady++;
                }
            }

            var placementReadiness = new
            {
                ready = totalReady,
                notReady = totalNotReady,
                readyPercentage = Math.Round((double)totalReady / totalStudents * 100, 1),
                details = new
                {
                    hodApproved = totalHODApproved,
                    githubLinked = totalGithubLinked,
                    projectVetted = totalProjectVetted,
                    certificationVetted = totalCertificationVetted
                }
            };

            // 6. Student Engagement Analytics (Logged NGO activities & Weekly index)
            int totalActivitiesLogged = studentsList.Sum(s => s.Activities?.Count ?? 0);
            var recentActivitiesList = new List<TimelineItem>();

            foreach (var student in studentsList)
            {
                if (student.Projects != null)
                {
                    foreach (var p in student.Projects)
                    {
                        recentActivitiesList.Add(new TimelineItem {
                            StudentName = student.Name,
                            ActivityType = "Project Uploaded",
                            Detail = p.Title,
                            Date = student.UpdatedAt
                        });
                    }
                }
                if (student.Certifications != null)
                {
                    foreach (var c in student.Certifications)
                    {
                        recentActivitiesList.Add(new TimelineItem {
                            StudentName = student.Name,
                            ActivityType = "Certification Achieved",
                            Detail = $"{c.Name} ({c.IssuingOrganization})",
                            Date = c.IssueDate
                        });
                    }
                }
                if (student.ResearchInnovations != null)
                {
                    foreach (var r in student.ResearchInnovations)
                    {
                        recentActivitiesList.Add(new TimelineItem {
                            StudentName = student.Name,
                            ActivityType = "Research Logged",
                            Detail = $"{r.Title} ({r.Type})",
                            Date = r.Date
                        });
                    }
                }
                if (student.Activities != null)
                {
                    foreach (var a in student.Activities)
                    {
                        recentActivitiesList.Add(new TimelineItem {
                            StudentName = student.Name,
                            ActivityType = "NGO/Sports Event",
                            Detail = $"{a.Title} ({a.Organization})",
                            Date = a.StartDate
                        });
                    }
                }
            }

            var recentTimeline = recentActivitiesList
                .OrderByDescending(t => t.Date)
                .Take(8)
                .Select(t => new {
                    t.StudentName,
                    t.ActivityType,
                    t.Detail,
                    DateStr = t.Date.ToString("yyyy-MM-dd HH:mm")
                })
                .ToList();

            var studentEngagement = new
            {
                totalActivities = totalActivitiesLogged,
                averageChecklistScore,
                recentTimeline
            };

            return Ok(new
            {
                totalStudents,
                approvedStudents,
                pendingStudents,
                averageCompletionRate,
                completionDistribution,
                completionMetrics,
                departmentPerformance,
                skillAnalytics,
                researchActivity,
                placementReadiness,
                studentEngagement
            });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            if (!IsAdminRequest())
                return Unauthorized(new { message = "Only administrators can access this resource." });

            var staffDept = await GetStaffDepartmentAsync();

            var query = _context.Users.AsQueryable();

            if (staffDept != null)
            {
                // Staff only sees students of their own department
                query = query.Where(u => u.Role == "Student" && u.Department == staffDept);
            }
            else
            {
                // Admins see students only in the Student Registry
                query = query.Where(u => u.Role == "Student");
            }

            var users = await query
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.Gender,
                    u.Department,
                    u.Role,
                    u.Username,
                    u.IsApproved,
                    u.IsBlocked,
                    Title = u.Title ?? string.Empty,
                    Phone = u.Phone ?? string.Empty,
                    AcademicRecordsCount = u.AcademicRecords.Count,
                    CertificationsCount = u.Certifications.Count,
                    ActivitiesCount = u.Activities.Count,
                    ProjectsCount = u.Projects.Count,
                    ResearchInnovationsCount = u.ResearchInnovations.Count
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("users/{userId}/credentials")]
        public async Task<IActionResult> GetUserCredentials(Guid userId)
        {
            if (!IsAdminRequest())
                return Unauthorized(new { message = "Only administrators can access this resource." });

            var staffDept = await GetStaffDepartmentAsync();

            var user = await _context.Users
                .Include(u => u.AcademicRecords)
                .Include(u => u.Certifications)
                .Include(u => u.Activities)
                .Include(u => u.Projects)
                .Include(u => u.ResearchInnovations)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound(new { message = "User not found" });

            if (staffDept != null && user.Department != staffDept)
            {
                return Unauthorized(new { message = "You can only view credentials of students in your department." });
            }

            return Ok(new
            {
                academicRecords = user.AcademicRecords.ToList(),
                certifications = user.Certifications.ToList(),
                activities = user.Activities.ToList(),
                projects = user.Projects.ToList(),
                researchInnovations = user.ResearchInnovations.ToList()
            });
        }

        [HttpDelete("users/{userId}")]
        public async Task<IActionResult> DeleteUser(Guid userId)
        {
            if (!IsAdminRequest())
                return Unauthorized(new { message = "Only administrators can perform this action." });

            var staffDept = await GetStaffDepartmentAsync();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return NotFound(new { message = "User not found" });

            if (user.Role == "Admin")
                return BadRequest(new { message = "Administrators cannot be deleted." });

            if (staffDept != null)
            {
                if (user.Role != "Student" || user.Department != staffDept)
                {
                    return Unauthorized(new { message = "You can only delete students from your own department." });
                }
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"User {user.Name} deleted successfully." });
        }

        [HttpDelete("credentials/{type}/{id}")]
        public async Task<IActionResult> DeleteCredential(string type, Guid id)
        {
            if (!IsAdminRequest())
                return Unauthorized(new { message = "Only administrators can perform this action." });

            var staffDept = await GetStaffDepartmentAsync();

            Guid ownerUserId = Guid.Empty;

            AcademicRecord? academicRecord = null;
            Certification? certificationRecord = null;
            Activity? activityRecord = null;
            Project? projectRecord = null;
            ResearchInnovation? researchRecord = null;

            switch (type.ToLower())
            {
                case "academic":
                    academicRecord = await _context.AcademicRecords.FindAsync(id);
                    if (academicRecord == null) return NotFound(new { message = "Academic record not found" });
                    ownerUserId = academicRecord.UserId;
                    break;
                case "certification":
                    certificationRecord = await _context.Certifications.FindAsync(id);
                    if (certificationRecord == null) return NotFound(new { message = "Certification not found" });
                    ownerUserId = certificationRecord.UserId;
                    break;
                case "activity":
                    activityRecord = await _context.Activities.FindAsync(id);
                    if (activityRecord == null) return NotFound(new { message = "Activity not found" });
                    ownerUserId = activityRecord.UserId;
                    break;
                case "project":
                    projectRecord = await _context.Projects.FindAsync(id);
                    if (projectRecord == null) return NotFound(new { message = "Project not found" });
                    ownerUserId = projectRecord.UserId;
                    break;
                case "researchinnovation":
                    researchRecord = await _context.ResearchInnovations.FindAsync(id);
                    if (researchRecord == null) return NotFound(new { message = "Research/Innovation record not found" });
                    ownerUserId = researchRecord.UserId;
                    break;
                default:
                    return BadRequest(new { message = "Invalid credential type." });
            }

            if (staffDept != null)
            {
                var owner = await _context.Users.FindAsync(ownerUserId);
                if (owner == null || owner.Department != staffDept || owner.Role != "Student")
                {
                    return Unauthorized(new { message = "You can only delete credentials belonging to students in your department." });
                }
            }

            // Perform actual removal using the already loaded record
            switch (type.ToLower())
            {
                case "academic":
                    if (academicRecord != null) _context.AcademicRecords.Remove(academicRecord);
                    break;
                case "certification":
                    if (certificationRecord != null) _context.Certifications.Remove(certificationRecord);
                    break;
                case "activity":
                    if (activityRecord != null) _context.Activities.Remove(activityRecord);
                    break;
                case "project":
                    if (projectRecord != null) _context.Projects.Remove(projectRecord);
                    break;
                case "researchinnovation":
                    if (researchRecord != null) _context.ResearchInnovations.Remove(researchRecord);
                    break;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Credential deleted successfully." });
        }

        [HttpPost("register-staff")]
        public async Task<IActionResult> RegisterStaff([FromBody] DTOs.RegisterStaffDto dto)
        {
            if (!IsAdminRequest())
                return Unauthorized(new { message = "Only administrators can perform this action." });

            var staffDept = await GetStaffDepartmentAsync();
            if (staffDept != null)
            {
                return Unauthorized(new { message = "Only administrators can register staff members." });
            }

            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
            {
                return BadRequest(new { message = "Email is already registered" });
            }

            // Generate a secure temporary password
            string tempPassword = GenerateRandomPassword();

            // Simple unique username generation based on Name
            string baseUsername = dto.Name.Replace(" ", "-").ToLower();
            string username = baseUsername;
            int counter = 1;
            while (await _context.Users.AnyAsync(u => u.Username == username))
            {
                username = $"{baseUsername}-{counter}";
                counter++;
            }

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(tempPassword),
                Gender = dto.Gender,
                Department = dto.Department,
                Role = "Staff",
                Username = username,
                IsApproved = true,
                Title = dto.Title,
                Phone = dto.Phone
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Send password to registered email
            await SendPasswordEmail(user.Email, tempPassword, user.Name);

            return Ok(new { message = "Staff registered successfully", username = user.Username, generatedPassword = tempPassword });
        }

        private string GenerateRandomPassword()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 10)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        private async Task SendPasswordEmail(string email, string password, string name)
        {
            var server = _configuration["Smtp:Server"] ?? "smtp.gmail.com";
            var port = int.Parse(_configuration["Smtp:Port"] ?? "587");
            var senderEmail = _configuration["Smtp:SenderEmail"] ?? "registry@mcc.edu.in";
            var senderName = _configuration["Smtp:SenderName"] ?? "MCC Registry Office";
            var username = _configuration["Smtp:Username"];
            var smtpPassword = _configuration["Smtp:Password"];
            var enableSsl = bool.Parse(_configuration["Smtp:EnableSsl"] ?? "true");

            try
            {
                var mailMessage = new System.Net.Mail.MailMessage();
                mailMessage.From = new System.Net.Mail.MailAddress(senderEmail, senderName);
                mailMessage.To.Add(email);
                mailMessage.Subject = "MCC Staff Portfolio Account Password Registration";
                mailMessage.Body = $"Hello {name},\n\nYour staff account at Madras Christian College has been registered.\n\nLogin Email: {email}\nTemporary Password: {password}\n\nPlease change your password after logging in.\n\nBest regards,\nMCC Registry Office";
                mailMessage.IsBodyHtml = false;

                using (var smtpClient = new System.Net.Mail.SmtpClient(server, port))
                {
                    smtpClient.EnableSsl = enableSsl;
                    smtpClient.UseDefaultCredentials = false;
                    if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(smtpPassword))
                    {
                        smtpClient.Credentials = new System.Net.NetworkCredential(username, smtpPassword);
                    }
                    
                    await smtpClient.SendMailAsync(mailMessage);
                }
                Console.WriteLine($"[SMTP] Successfully sent registration email to {email}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SMTP ERROR] Failed to send email to {email}: {ex.Message}");
            }
        }
        [HttpGet("staff")]
        public async Task<IActionResult> GetStaff()
        {
            if (!IsAdminRequest())
                return Unauthorized(new { message = "Only administrators can access this resource." });

            var staffDept = await GetStaffDepartmentAsync();
            if (staffDept != null)
            {
                return Unauthorized(new { message = "Only main administrators can access staff directory." });
            }

            var staff = await _context.Users
                .Where(u => u.Role == "Staff")
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.Gender,
                    u.Department,
                    u.Role,
                    u.Username,
                    u.IsApproved,
                    u.IsBlocked,
                    u.IsSuperAdmin,
                    Title = u.Title ?? string.Empty,
                    Phone = u.Phone ?? string.Empty,
                    u.CreatedAt
                })
                .OrderBy(u => u.Name)
                .ToListAsync();

            return Ok(staff);
        }

        [HttpPost("users/{userId}/toggle-block")]
        public async Task<IActionResult> ToggleBlockUser(Guid userId)
        {
            if (!IsAdminRequest())
                return Unauthorized(new { message = "Only administrators can perform this action." });

            var staffDept = await GetStaffDepartmentAsync();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            if (staffDept != null)
            {
                if (user.Role != "Student" || user.Department != staffDept)
                {
                    return Unauthorized(new { message = "You can only block students from your own department." });
                }
            }

            if (user.Role == "Admin")
                return BadRequest(new { message = "Administrators cannot be blocked." });

            user.IsBlocked = !user.IsBlocked;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"User {user.Name} has been {(user.IsBlocked ? "blocked" : "unblocked")} successfully.", isBlocked = user.IsBlocked });
        }

        [HttpPost("staff/{userId}/toggle-super-admin")]
        public async Task<IActionResult> ToggleSuperAdmin(Guid userId)
        {
            if (!IsAdminRequest())
                return Unauthorized(new { message = "Only administrators can perform this action." });

            var staffDept = await GetStaffDepartmentAsync();
            if (staffDept != null)
            {
                return Unauthorized(new { message = "Only main administrators can manage staff roles." });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.Role == "Staff");
            if (user == null)
                return NotFound(new { message = "Staff member not found." });

            user.IsSuperAdmin = !user.IsSuperAdmin;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Staff member {user.Name} Super Admin role has been {(user.IsSuperAdmin ? "enabled" : "disabled")} successfully.", isSuperAdmin = user.IsSuperAdmin });
        }

        public class SendNotificationRequest
        {
            public string Target { get; set; } = "all"; // "all", "students", "staff", "user", "department"
            public Guid? TargetUserId { get; set; }
            public string? TargetDepartment { get; set; }
            public string Message { get; set; } = string.Empty;
            public string Type { get; set; } = "Info"; // "Info", "Success", "Warning", "Error"
        }

        [HttpGet("notifications/recipients")]
        public async Task<IActionResult> GetNotificationRecipients()
        {
            if (!IsAdminRequest())
                return Unauthorized(new { message = "Only administrators can access this resource." });

            var staffDept = await GetStaffDepartmentAsync();

            var query = _context.Users.AsQueryable();

            if (staffDept != null)
            {
                // Staff can only target students in their own department
                query = query.Where(u => u.Role == "Student" && u.Department == staffDept);
            }
            else
            {
                // Super Admin can target all students and staff
                query = query.Where(u => u.Role == "Student" || u.Role == "Staff");
            }

            var recipients = await query
                .OrderBy(u => u.Name)
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.Role,
                    u.Department
                })
                .ToListAsync();

            return Ok(recipients);
        }

        [HttpPost("notifications/send")]
        public async Task<IActionResult> SendNotification([FromBody] SendNotificationRequest request)
        {
            if (!IsAdminRequest())
                return Unauthorized(new { message = "Only administrators can send notifications." });

            if (request == null || string.IsNullOrWhiteSpace(request.Message))
                return BadRequest(new { message = "Notification message cannot be empty." });

            var staffDept = await GetStaffDepartmentAsync();

            // Validate that staff only sends to targets within their department
            if (staffDept != null)
            {
                if (request.Target == "all" || request.Target == "staff")
                {
                    return Unauthorized(new { message = "Department staff cannot broadcast to all users or staff." });
                }
                
                if (request.Target == "department" && request.TargetDepartment != staffDept)
                {
                    return Unauthorized(new { message = "Department staff can only notify their own department." });
                }
            }

            var userIds = new List<Guid>();

            if (request.Target == "all")
            {
                userIds = await _context.Users.Select(u => u.Id).ToListAsync();
            }
            else if (request.Target == "students")
            {
                userIds = await _context.Users.Where(u => u.Role == "Student").Select(u => u.Id).ToListAsync();
            }
            else if (request.Target == "staff")
            {
                userIds = await _context.Users.Where(u => u.Role == "Staff" || u.Role == "Admin").Select(u => u.Id).ToListAsync();
            }
            else if (request.Target == "department")
            {
                var dept = staffDept ?? request.TargetDepartment;
                if (string.IsNullOrEmpty(dept))
                {
                    return BadRequest(new { message = "Department must be specified." });
                }
                userIds = await _context.Users.Where(u => u.Department == dept).Select(u => u.Id).ToListAsync();
            }
            else if (request.Target == "user")
            {
                if (request.TargetUserId == null)
                {
                    return BadRequest(new { message = "User must be specified." });
                }
                var userExists = await _context.Users.AnyAsync(u => u.Id == request.TargetUserId.Value);
                if (!userExists)
                {
                    return NotFound(new { message = "Specified user not found." });
                }
                if (staffDept != null)
                {
                    var userDept = await _context.Users.Where(u => u.Id == request.TargetUserId.Value).Select(u => u.Department).FirstOrDefaultAsync();
                    if (userDept != staffDept)
                    {
                        return Unauthorized(new { message = "You can only notify users within your department." });
                    }
                }
                userIds.Add(request.TargetUserId.Value);
            }
            else
            {
                return BadRequest(new { message = "Invalid notification target." });
            }

            var notifications = userIds.Select(id => new Notification
            {
                Id = Guid.NewGuid(),
                UserId = id,
                Message = request.Message,
                Type = request.Type,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            _context.Notifications.AddRange(notifications);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Notification successfully dispatched to {notifications.Count} recipient(s)." });
        }

        [HttpGet("alumni")]
        public async Task<IActionResult> GetAlumni()
        {
            if (!IsAdminRequest())
                return Unauthorized(new { message = "Only administrators can access this resource." });

            var staffDept = await GetStaffDepartmentAsync();

            var query = _context.Users
                .Include(u => u.Profile)
                .Include(u => u.AcademicRecords)
                .Include(u => u.Projects)
                .Include(u => u.Certifications)
                .Where(u => u.Role == "Student");

            if (staffDept != null)
            {
                query = query.Where(u => u.Department == staffDept);
            }

            var students = await query.ToListAsync();
            var currentYear = DateTime.UtcNow.Year;

            var alumniList = students
                .Where(u => u.AcademicRecords.Any(ar => 
                    (string.IsNullOrEmpty(ar.Institution) || ar.Institution.ToLower().Contains("madras christian") || ar.Institution.ToLower().Contains("mcc")) &&
                    (!ar.IsCurrentlyStudying || (ar.Level != null && (ar.Level.ToUpper() == "UG" || ar.Level.ToUpper() == "PG") && ar.EndYear < currentYear))
                ))
                .Select(u => {
                    var latestCompletedRecord = u.AcademicRecords
                        .Where(ar => 
                            (string.IsNullOrEmpty(ar.Institution) || ar.Institution.ToLower().Contains("madras christian") || ar.Institution.ToLower().Contains("mcc")) &&
                            (!ar.IsCurrentlyStudying || (ar.Level != null && (ar.Level.ToUpper() == "UG" || ar.Level.ToUpper() == "PG") && ar.EndYear < currentYear))
                        )
                        .OrderByDescending(ar => ar.EndYear)
                        .FirstOrDefault();

                    return new
                    {
                        u.Id,
                        u.Name,
                        u.Email,
                        u.Gender,
                        u.Department,
                        u.Username,
                        u.IsApproved,
                        u.IsBlocked,
                        Bio = u.Profile?.Bio ?? string.Empty,
                        Skills = u.Profile?.Skills ?? string.Empty,
                        ProfileImageUrl = u.Profile?.ProfileImageUrl ?? string.Empty,
                        Phone = u.Profile?.Phone ?? string.Empty,
                        Degree = latestCompletedRecord?.Degree ?? "Unknown Degree",
                        GraduationYear = latestCompletedRecord?.StartYear ?? 0,
                        StartYear = latestCompletedRecord?.StartYear ?? 0,
                        EndYear = latestCompletedRecord?.EndYear ?? 0,
                        GradeOrCgpa = latestCompletedRecord?.GradeOrCgpa ?? string.Empty,
                        ProjectsCount = u.Projects?.Count ?? 0,
                        CertificationsCount = u.Certifications?.Count ?? 0
                    };
                })
                .OrderByDescending(a => a.GraduationYear)
                .ThenBy(a => a.Name)
                .ToList();

            return Ok(alumniList);
        }

        public class CreateDepartmentDto
        {
            public string Name { get; set; } = string.Empty;
        }

        [HttpGet("departments")]
        public async Task<IActionResult> GetDepartmentsAdmin()
        {
            if (!IsAdminRequest())
                return Unauthorized(new { message = "Only administrators can access this resource." });

            var departments = await _context.Departments
                .OrderBy(d => d.Name)
                .ToListAsync();

            return Ok(departments);
        }

        [HttpPost("departments")]
        public async Task<IActionResult> CreateDepartment([FromBody] CreateDepartmentDto dto)
        {
            if (!IsAdminRequest())
                return Unauthorized(new { message = "Only administrators can perform this action." });

            var staffDept = await GetStaffDepartmentAsync();
            if (staffDept != null)
            {
                return Unauthorized(new { message = "Only main administrators can manage departments." });
            }

            if (dto == null || string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "Department name is required." });

            var nameTrimmed = dto.Name.Trim();
            if (nameTrimmed.Length < 2 || nameTrimmed.Length > 100)
                return BadRequest(new { message = "Department name must be between 2 and 100 characters." });

            var exists = await _context.Departments
                .AnyAsync(d => d.Name.ToLower() == nameTrimmed.ToLower());

            if (exists)
                return BadRequest(new { message = "A department with this name already exists." });

            var dept = new Department
            {
                Name = nameTrimmed
            };

            _context.Departments.Add(dept);
            await _context.SaveChangesAsync();

            return Ok(dept);
        }

        [HttpDelete("departments/{id}")]
        public async Task<IActionResult> DeleteDepartment(Guid id)
        {
            if (!IsAdminRequest())
                return Unauthorized(new { message = "Only administrators can perform this action." });

            var staffDept = await GetStaffDepartmentAsync();
            if (staffDept != null)
            {
                return Unauthorized(new { message = "Only main administrators can manage departments." });
            }

            var dept = await _context.Departments.FindAsync(id);
            if (dept == null)
                return NotFound(new { message = "Department not found." });

            // Update any users in this department to "Unassigned"
            var usersInDept = await _context.Users
                .Where(u => u.Department.ToLower() == dept.Name.ToLower())
                .ToListAsync();

            foreach (var user in usersInDept)
            {
                user.Department = "Unassigned";
            }

            _context.Departments.Remove(dept);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Department '{dept.Name}' deleted successfully." });
        }

        private class TimelineItem
        {
            public string StudentName { get; set; } = string.Empty;
            public string ActivityType { get; set; } = string.Empty;
            public string Detail { get; set; } = string.Empty;
            public DateTime Date { get; set; }
        }
    }
}
