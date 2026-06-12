using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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
    [ApiController]
    [Route("api/[controller]")]
    public class StudentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StudentController(AppDbContext context)
        {
            _context = context;
        }

        private async Task<Student?> GetCurrentStudentAsync()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("nameid");
            if (claim == null || !Guid.TryParse(claim.Value, out Guid userId))
            {
                return null;
            }
            return await _context.Students
                .Include(s => s.Portfolio)
                .SingleOrDefaultAsync(s => s.UserId == userId);
        }

        #region Public Portfolio Retrieval
        [AllowAnonymous]
        [HttpGet("public-portfolios")]
        public async Task<IActionResult> GetPublicPortfolios([FromQuery] string? search, [FromQuery] string? department)
        {
            var query = _context.Portfolios
                .Include(p => p.Student)
                .ThenInclude(s => s.Projects)
                .Include(p => p.Student)
                .ThenInclude(s => s.Publications)
                .Include(p => p.Student)
                .ThenInclude(s => s.Certifications)
                .Where(p => p.IsPublic && p.IsApproved);

            if (!string.IsNullOrEmpty(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(p => 
                    p.Student.FirstName.ToLower().Contains(lowerSearch) || 
                    p.Student.LastName.ToLower().Contains(lowerSearch) ||
                    p.Student.Bio.ToLower().Contains(lowerSearch) ||
                    p.Student.RollNumber.ToLower().Contains(lowerSearch) ||
                    p.Student.Projects.Any(pr => pr.Title.ToLower().Contains(lowerSearch) || pr.TechnologiesUsed.ToLower().Contains(lowerSearch))
                );
            }

            if (!string.IsNullOrEmpty(department))
            {
                query = query.Where(p => p.Student.Department.ToLower() == department.ToLower());
            }

            var portfolios = await query
                .Select(p => new
                {
                    p.Slug,
                    p.StatementOfPurpose,
                    Student = new
                    {
                        p.Student.FirstName,
                        p.Student.LastName,
                        p.Student.Department,
                        p.Student.BatchYear,
                        p.Student.Bio,
                        p.Student.AvatarUrl,
                        ProjectsCount = p.Student.Projects.Count,
                        PublicationsCount = p.Student.Publications.Count,
                        CertificationsCount = p.Student.Certifications.Count
                    }
                })
                .ToListAsync();

            return Ok(portfolios);
        }

        [AllowAnonymous]
        [HttpGet("public-publications")]
        public async Task<IActionResult> GetPublicPublications([FromQuery] string? search, [FromQuery] string? department)
        {
            var query = _context.Publications
                .Include(p => p.Student)
                .ThenInclude(s => s.Portfolio)
                .Where(p => p.Student.Portfolio != null && p.Student.Portfolio.IsPublic && p.Student.Portfolio.IsApproved)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(p =>
                    p.Title.ToLower().Contains(lowerSearch) ||
                    p.JournalOrConference.ToLower().Contains(lowerSearch) ||
                    p.Authors.ToLower().Contains(lowerSearch) ||
                    p.Abstract.ToLower().Contains(lowerSearch) ||
                    (p.Student.FirstName + " " + p.Student.LastName).ToLower().Contains(lowerSearch)
                );
            }

            if (!string.IsNullOrEmpty(department) && department != "All" && department != "")
            {
                query = query.Where(p => p.Student.Department.ToLower() == department.ToLower());
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
                        p.Student.FirstName,
                        p.Student.LastName,
                        p.Student.Department,
                        p.Student.RollNumber,
                        Slug = p.Student.Portfolio != null ? p.Student.Portfolio.Slug : ""
                    }
                })
                .ToListAsync();

            return Ok(publications);
        }


        public class RecruiterConnectRequest
        {
            [Required]
            [MaxLength(100)]
            public string CompanyName { get; set; } = string.Empty;

            [Required]
            [MaxLength(100)]
            public string RecruiterName { get; set; } = string.Empty;

            [Required]
            [EmailAddress]
            [MaxLength(100)]
            public string RecruiterEmail { get; set; } = string.Empty;

            [Required]
            [MaxLength(2000)]
            public string Message { get; set; } = string.Empty;
        }

        [AllowAnonymous]
        [HttpPost("portfolio/{slug}/connect")]
        public async Task<IActionResult> RecruiterConnect(string slug, [FromBody] RecruiterConnectRequest request)
        {
            var portfolio = await _context.Portfolios.SingleOrDefaultAsync(p => p.Slug.ToLower() == slug.ToLower());
            if (portfolio == null) return NotFound("Student portfolio not found.");

            var lead = new RecruiterLead
            {
                StudentId = portfolio.StudentId,
                CompanyName = request.CompanyName,
                RecruiterName = request.RecruiterName,
                RecruiterEmail = request.RecruiterEmail,
                Message = request.Message,
                CreatedAt = DateTime.UtcNow
            };

            _context.RecruiterLeads.Add(lead);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Connection request successfully delivered." });
        }

        [AllowAnonymous]
        [HttpGet("portfolio/{slug}")]
        public async Task<IActionResult> GetPublicPortfolioBySlug(string slug)
        {
            var portfolio = await _context.Portfolios
                .Include(p => p.Student)
                .ThenInclude(s => s.Projects)
                .Include(p => p.Student)
                .ThenInclude(s => s.Certifications)
                .Include(p => p.Student)
                .ThenInclude(s => s.Publications)
                .Include(p => p.Student)
                .ThenInclude(s => s.Achievements)
                .Include(p => p.Student)
                .ThenInclude(s => s.CommunityServices)
                .Include(p => p.Student)
                .ThenInclude(s => s.ConferencePresentations)
                .Include(p => p.Student)
                .ThenInclude(s => s.ScienceFairEntries)
                .SingleOrDefaultAsync(p => p.Slug.ToLower() == slug.ToLower());

            if (portfolio == null)
            {
                return NotFound("Portfolio not found.");
            }

            if (!portfolio.IsPublic)
            {
                return BadRequest("This portfolio is private.");
            }

            var student = portfolio.Student;

            var result = new
            {
                portfolio.Slug,
                portfolio.IsPublic,
                portfolio.LayoutSettingsJson,
                portfolio.StatementOfPurpose,
                portfolio.StoryTitle,
                portfolio.StoryContent,
                Student = new
                {
                    student.FirstName,
                    student.LastName,
                    student.RollNumber,
                    student.Department,
                    student.BatchYear,
                    student.Bio,
                    student.AvatarUrl,
                    student.GithubUsername,
                    student.BehanceUsername
                },
                Projects = student.Projects.OrderByDescending(p => p.CreatedAt).Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.Description,
                    p.GithubUrl,
                    p.LiveUrl,
                    p.TechnologiesUsed,
                    p.ImageUrl,
                    p.ProjectType,
                    p.DemoVideoUrl,
                    p.CreatedAt
                }),
                Certifications = student.Certifications.OrderByDescending(c => c.IssueDate).Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.IssuingOrganization,
                    c.IssueDate,
                    c.ExpirationDate,
                    c.CredentialId,
                    c.CredentialUrl
                }),
                Publications = student.Publications.OrderByDescending(p => p.PublishDate).Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.JournalOrConference,
                    p.PublishDate,
                    p.PaperUrl,
                    p.Abstract,
                    p.Authors,
                    p.PublicationType,
                    p.DoiOrIsbn
                }),
                Achievements = student.Achievements.OrderByDescending(a => a.DateEarned).Select(a => new
                {
                    a.Id,
                    a.Title,
                    a.Description,
                    a.DateEarned,
                    a.Category,
                    a.CertificateUrl
                }),
                CommunityServices = student.CommunityServices.OrderByDescending(c => c.StartDate).Select(c => new
                {
                    c.Id,
                    c.Organization,
                    c.Role,
                    c.Description,
                    c.StartDate,
                    c.EndDate
                }),
                ConferencePresentations = student.ConferencePresentations.OrderByDescending(c => c.PresentationDate).Select(c => new
                {
                    c.Id,
                    c.Title,
                    c.ConferenceName,
                    c.Role,
                    c.Location,
                    c.PresentationDate,
                    c.AbstractUrl,
                    c.CertificateUrl,
                    c.IsVerified
                }),
                ScienceFairEntries = student.ScienceFairEntries.OrderByDescending(sf => sf.FairDate).Select(sf => new
                {
                    sf.Id,
                    sf.FairName,
                    sf.ProjectTitle,
                    sf.Description,
                    sf.Level,
                    sf.AwardReceived,
                    sf.FairDate,
                    sf.CertificateUrl,
                    sf.IsVerified
                })
            };

            return Ok(result);
        }
        #endregion

        #region Student Profile & Settings
        [Authorize]
        [HttpGet("leads")]
        public async Task<IActionResult> GetLeads()
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student profile not found.");

            var leads = await _context.RecruiterLeads
                .Where(r => r.StudentId == student.Id)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(leads);
        }

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student profile not found.");

            // Fetch complete student record
            var fullStudent = await _context.Students
                .Include(s => s.Projects)
                .Include(s => s.Certifications)
                .Include(s => s.Publications)
                .Include(s => s.Achievements)
                .Include(s => s.CommunityServices)
                .Include(s => s.ConferencePresentations)
                .Include(s => s.ScienceFairEntries)
                .SingleOrDefaultAsync(s => s.Id == student.Id);

            return Ok(new
            {
                Profile = new
                {
                    fullStudent!.Id,
                    fullStudent.RollNumber,
                    fullStudent.FirstName,
                    fullStudent.LastName,
                    fullStudent.Department,
                    fullStudent.BatchYear,
                    fullStudent.Bio,
                    fullStudent.AvatarUrl,
                    fullStudent.GithubUsername,
                    fullStudent.BehanceUsername,
                    fullStudent.Cgpa,
                    fullStudent.IsAlumni,
                    fullStudent.CurrentCompany,
                    fullStudent.CurrentRole
                },
                Portfolio = new
                {
                    student.Portfolio?.Slug,
                    student.Portfolio?.IsPublic,
                    student.Portfolio?.LayoutSettingsJson,
                    student.Portfolio?.StatementOfPurpose,
                    student.Portfolio?.StoryTitle,
                    student.Portfolio?.StoryContent,
                    student.Portfolio?.ReviewRemarks,
                    student.Portfolio?.ReviewedBy
                },
                Projects = fullStudent.Projects.OrderByDescending(p => p.CreatedAt),
                Certifications = fullStudent.Certifications.OrderByDescending(c => c.IssueDate),
                Publications = fullStudent.Publications.OrderByDescending(p => p.PublishDate),
                Achievements = fullStudent.Achievements.OrderByDescending(a => a.DateEarned),
                CommunityServices = fullStudent.CommunityServices.OrderByDescending(c => c.StartDate),
                ConferencePresentations = fullStudent.ConferencePresentations.OrderByDescending(c => c.PresentationDate),
                ScienceFairEntries = fullStudent.ScienceFairEntries.OrderByDescending(sf => sf.FairDate)
            });
        }

        [Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] Student updatedInfo)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student profile not found.");

            if (updatedInfo.Cgpa < 0.0 || updatedInfo.Cgpa > 10.0)
            {
                return BadRequest("CGPA must be between 0.0 and 10.0.");
            }

            student.Bio = updatedInfo.Bio;
            student.AvatarUrl = updatedInfo.AvatarUrl;
            student.GithubUsername = updatedInfo.GithubUsername;
            student.BehanceUsername = updatedInfo.BehanceUsername;
            student.FirstName = updatedInfo.FirstName;
            student.LastName = updatedInfo.LastName;
            student.Department = updatedInfo.Department;
            student.BatchYear = updatedInfo.BatchYear;
            student.Cgpa = updatedInfo.Cgpa;

            await _context.SaveChangesAsync();
            return Ok(student);
        }

        [Authorize]
        [HttpPut("portfolio")]
        public async Task<IActionResult> UpdatePortfolioSettings([FromBody] Models.Portfolio updatedPortfolio)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student profile not found.");

            var portfolio = student.Portfolio;
            if (portfolio == null)
            {
                portfolio = new Models.Portfolio
                {
                    StudentId = student.Id,
                    Slug = student.FirstName.ToLower() + "-" + student.LastName.ToLower()
                };
                _context.Portfolios.Add(portfolio);
            }

            // Verify unique slug
            if (!string.IsNullOrEmpty(updatedPortfolio.Slug) && updatedPortfolio.Slug != portfolio.Slug)
            {
                var exists = await _context.Portfolios.AnyAsync(p => p.Slug.ToLower() == updatedPortfolio.Slug.ToLower());
                if (exists)
                {
                    return BadRequest("Slug is already taken by another student.");
                }
                portfolio.Slug = updatedPortfolio.Slug.Replace(" ", "-").ToLower();
            }

            portfolio.IsPublic = updatedPortfolio.IsPublic;
            portfolio.LayoutSettingsJson = updatedPortfolio.LayoutSettingsJson;
            portfolio.StatementOfPurpose = updatedPortfolio.StatementOfPurpose;
            portfolio.StoryTitle = updatedPortfolio.StoryTitle;
            portfolio.StoryContent = updatedPortfolio.StoryContent;

            await _context.SaveChangesAsync();
            return Ok(portfolio);
        }
        #endregion

        #region CRUD: Projects
        [Authorize]
        [HttpPost("projects")]
        public async Task<IActionResult> CreateProject(Project project)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            project.StudentId = student.Id;
            project.CreatedAt = DateTime.UtcNow;
            _context.Projects.Add(project);
            await _context.SaveChangesAsync();
            return Ok(project);
        }

        [Authorize]
        [HttpPut("projects/{id}")]
        public async Task<IActionResult> UpdateProject(Guid id, Project updatedProject)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            var project = await _context.Projects.SingleOrDefaultAsync(p => p.Id == id && p.StudentId == student.Id);
            if (project == null) return NotFound("Project not found.");

            project.Title = updatedProject.Title;
            project.Description = updatedProject.Description;
            project.GithubUrl = updatedProject.GithubUrl;
            project.LiveUrl = updatedProject.LiveUrl;
            project.TechnologiesUsed = updatedProject.TechnologiesUsed;
            project.ImageUrl = updatedProject.ImageUrl;
            project.ProjectType = updatedProject.ProjectType;
            project.DemoVideoUrl = updatedProject.DemoVideoUrl;

            await _context.SaveChangesAsync();
            return Ok(project);
        }

        [Authorize]
        [HttpDelete("projects/{id}")]
        public async Task<IActionResult> DeleteProject(Guid id)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            var project = await _context.Projects.SingleOrDefaultAsync(p => p.Id == id && p.StudentId == student.Id);
            if (project == null) return NotFound("Project not found.");

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Project deleted." });
        }
        #endregion

        #region CRUD: Certifications
        [Authorize]
        [HttpPost("certifications")]
        public async Task<IActionResult> CreateCert(Certification cert)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            cert.StudentId = student.Id;
            _context.Certifications.Add(cert);
            await _context.SaveChangesAsync();
            return Ok(cert);
        }

        [Authorize]
        [HttpPut("certifications/{id}")]
        public async Task<IActionResult> UpdateCert(Guid id, Certification updatedCert)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            var cert = await _context.Certifications.SingleOrDefaultAsync(c => c.Id == id && c.StudentId == student.Id);
            if (cert == null) return NotFound("Certification not found.");

            cert.Name = updatedCert.Name;
            cert.IssuingOrganization = updatedCert.IssuingOrganization;
            cert.IssueDate = updatedCert.IssueDate;
            cert.ExpirationDate = updatedCert.ExpirationDate;
            cert.CredentialId = updatedCert.CredentialId;
            cert.CredentialUrl = updatedCert.CredentialUrl;

            await _context.SaveChangesAsync();
            return Ok(cert);
        }

        [Authorize]
        [HttpDelete("certifications/{id}")]
        public async Task<IActionResult> DeleteCert(Guid id)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            var cert = await _context.Certifications.SingleOrDefaultAsync(c => c.Id == id && c.StudentId == student.Id);
            if (cert == null) return NotFound("Certification not found.");

            _context.Certifications.Remove(cert);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Certification deleted." });
        }
        #endregion

        #region CRUD: Publications
        [Authorize]
        [HttpPost("publications")]
        public async Task<IActionResult> CreatePub(Publication pub)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            pub.StudentId = student.Id;
            _context.Publications.Add(pub);
            await _context.SaveChangesAsync();
            return Ok(pub);
        }

        [Authorize]
        [HttpPut("publications/{id}")]
        public async Task<IActionResult> UpdatePub(Guid id, Publication updatedPub)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            var pub = await _context.Publications.SingleOrDefaultAsync(p => p.Id == id && p.StudentId == student.Id);
            if (pub == null) return NotFound("Publication not found.");

            pub.Title = updatedPub.Title;
            pub.JournalOrConference = updatedPub.JournalOrConference;
            pub.PublishDate = updatedPub.PublishDate;
            pub.PaperUrl = updatedPub.PaperUrl;
            pub.Abstract = updatedPub.Abstract;
            pub.Authors = updatedPub.Authors;
            pub.PublicationType = updatedPub.PublicationType;
            pub.DoiOrIsbn = updatedPub.DoiOrIsbn;

            await _context.SaveChangesAsync();
            return Ok(pub);
        }

        [Authorize]
        [HttpDelete("publications/{id}")]
        public async Task<IActionResult> DeletePub(Guid id)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            var pub = await _context.Publications.SingleOrDefaultAsync(p => p.Id == id && p.StudentId == student.Id);
            if (pub == null) return NotFound("Publication not found.");

            _context.Publications.Remove(pub);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Publication deleted." });
        }
        #endregion

        #region CRUD: Conference Presentations
        [Authorize]
        [HttpPost("conferences")]
        public async Task<IActionResult> CreateConference(ConferencePresentation conf)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            conf.Id = Guid.NewGuid();
            conf.StudentId = student.Id;
            conf.IsVerified = false;
            conf.VerificationRemarks = string.Empty;
            conf.VerifiedBy = string.Empty;
            conf.CreatedAt = DateTime.UtcNow;

            _context.ConferencePresentations.Add(conf);
            await _context.SaveChangesAsync();
            return Ok(conf);
        }

        [Authorize]
        [HttpPut("conferences/{id}")]
        public async Task<IActionResult> UpdateConference(Guid id, ConferencePresentation updatedConf)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            var conf = await _context.ConferencePresentations.SingleOrDefaultAsync(c => c.Id == id && c.StudentId == student.Id);
            if (conf == null) return NotFound("Conference presentation not found.");

            conf.Title = updatedConf.Title;
            conf.ConferenceName = updatedConf.ConferenceName;
            conf.Role = updatedConf.Role;
            conf.Location = updatedConf.Location;
            conf.PresentationDate = updatedConf.PresentationDate;
            conf.AbstractUrl = updatedConf.AbstractUrl;
            conf.CertificateUrl = updatedConf.CertificateUrl;
            // Reset verification status on update
            conf.IsVerified = false;
            conf.VerificationRemarks = string.Empty;
            conf.VerifiedBy = string.Empty;

            await _context.SaveChangesAsync();
            return Ok(conf);
        }

        [Authorize]
        [HttpDelete("conferences/{id}")]
        public async Task<IActionResult> DeleteConference(Guid id)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            var conf = await _context.ConferencePresentations.SingleOrDefaultAsync(c => c.Id == id && c.StudentId == student.Id);
            if (conf == null) return NotFound("Conference presentation not found.");

            _context.ConferencePresentations.Remove(conf);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Conference presentation deleted." });
        }
        #endregion

        #region CRUD: Science Fair Entries
        [Authorize]
        [HttpPost("science-fairs")]
        public async Task<IActionResult> CreateScienceFair(ScienceFairEntry fair)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            fair.Id = Guid.NewGuid();
            fair.StudentId = student.Id;
            fair.IsVerified = false;
            fair.VerificationRemarks = string.Empty;
            fair.VerifiedBy = string.Empty;
            fair.CreatedAt = DateTime.UtcNow;

            _context.ScienceFairEntries.Add(fair);
            await _context.SaveChangesAsync();
            return Ok(fair);
        }

        [Authorize]
        [HttpPut("science-fairs/{id}")]
        public async Task<IActionResult> UpdateScienceFair(Guid id, ScienceFairEntry updatedFair)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            var fair = await _context.ScienceFairEntries.SingleOrDefaultAsync(sf => sf.Id == id && sf.StudentId == student.Id);
            if (fair == null) return NotFound("Science fair entry not found.");

            fair.FairName = updatedFair.FairName;
            fair.ProjectTitle = updatedFair.ProjectTitle;
            fair.Description = updatedFair.Description;
            fair.Level = updatedFair.Level;
            fair.AwardReceived = updatedFair.AwardReceived;
            fair.FairDate = updatedFair.FairDate;
            fair.CertificateUrl = updatedFair.CertificateUrl;
            // Reset verification status on update
            fair.IsVerified = false;
            fair.VerificationRemarks = string.Empty;
            fair.VerifiedBy = string.Empty;

            await _context.SaveChangesAsync();
            return Ok(fair);
        }

        [Authorize]
        [HttpDelete("science-fairs/{id}")]
        public async Task<IActionResult> DeleteScienceFair(Guid id)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            var fair = await _context.ScienceFairEntries.SingleOrDefaultAsync(sf => sf.Id == id && sf.StudentId == student.Id);
            if (fair == null) return NotFound("Science fair entry not found.");

            _context.ScienceFairEntries.Remove(fair);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Science fair entry deleted." });
        }
        #endregion

        #region CRUD: Achievements
        [Authorize]
        [HttpPost("achievements")]
        public async Task<IActionResult> CreateAchievement(Achievement ach)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            ach.StudentId = student.Id;
            _context.Achievements.Add(ach);
            await _context.SaveChangesAsync();
            return Ok(ach);
        }

        [Authorize]
        [HttpPut("achievements/{id}")]
        public async Task<IActionResult> UpdateAchievement(Guid id, Achievement updatedAch)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            var ach = await _context.Achievements.SingleOrDefaultAsync(a => a.Id == id && a.StudentId == student.Id);
            if (ach == null) return NotFound("Achievement not found.");

            ach.Title = updatedAch.Title;
            ach.Description = updatedAch.Description;
            ach.DateEarned = updatedAch.DateEarned;
            ach.Category = updatedAch.Category;
            ach.CertificateUrl = updatedAch.CertificateUrl;

            await _context.SaveChangesAsync();
            return Ok(ach);
        }

        [Authorize]
        [HttpDelete("achievements/{id}")]
        public async Task<IActionResult> DeleteAchievement(Guid id)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            var ach = await _context.Achievements.SingleOrDefaultAsync(a => a.Id == id && a.StudentId == student.Id);
            if (ach == null) return NotFound("Achievement not found.");

            _context.Achievements.Remove(ach);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Achievement deleted." });
        }
        #endregion

        #region CRUD: Community Services
        [Authorize]
        [HttpPost("community-services")]
        public async Task<IActionResult> CreateService(CommunityService service)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            service.StudentId = student.Id;
            _context.CommunityServices.Add(service);
            await _context.SaveChangesAsync();
            return Ok(service);
        }

        [Authorize]
        [HttpPut("community-services/{id}")]
        public async Task<IActionResult> UpdateService(Guid id, CommunityService updatedService)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            var service = await _context.CommunityServices.SingleOrDefaultAsync(s => s.Id == id && s.StudentId == student.Id);
            if (service == null) return NotFound("Community service record not found.");

            service.Organization = updatedService.Organization;
            service.Role = updatedService.Role;
            service.Description = updatedService.Description;
            service.StartDate = updatedService.StartDate;
            service.EndDate = updatedService.EndDate;

            await _context.SaveChangesAsync();
            return Ok(service);
        }

        [Authorize]
        [HttpDelete("community-services/{id}")]
        public async Task<IActionResult> DeleteService(Guid id)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            var service = await _context.CommunityServices.SingleOrDefaultAsync(s => s.Id == id && s.StudentId == student.Id);
            if (service == null) return NotFound("Community service record not found.");

            _context.CommunityServices.Remove(service);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Community service record deleted." });
        }
        #endregion

        #region Phase A: Ecosystem Additions
        public class AlumniUpdateDto
        {
            public bool IsAlumni { get; set; }
            public string? CurrentCompany { get; set; }
            public string? CurrentRole { get; set; }
        }

        [Authorize]
        [HttpPut("alumni")]
        public async Task<IActionResult> UpdateAlumniStatus([FromBody] AlumniUpdateDto alumniInfo)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student profile not found.");

            student.IsAlumni = alumniInfo.IsAlumni;
            student.CurrentCompany = alumniInfo.CurrentCompany ?? string.Empty;
            student.CurrentRole = alumniInfo.CurrentRole ?? string.Empty;

            await _context.SaveChangesAsync();
            return Ok(student);
        }

        [Authorize]
        [HttpGet("circulars")]
        public async Task<IActionResult> GetStudentCirculars()
        {
            var circulars = await _context.CampusCirculars
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
            return Ok(circulars);
        }

        [Authorize]
        [HttpGet("ideas")]
        public async Task<IActionResult> GetStudentStartupIdeas()
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student profile not found.");

            var ideas = await _context.StartupIdeas
                .Where(i => i.StudentId == student.Id)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();
            return Ok(ideas);
        }

        [Authorize]
        [HttpPost("ideas")]
        public async Task<IActionResult> CreateStartupIdea([FromBody] StartupIdea idea)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student profile not found.");

            if (!ModelState.IsValid) return BadRequest(ModelState);

            idea.Id = Guid.NewGuid();
            idea.StudentId = student.Id;
            idea.Status = "Pending";
            idea.CreatedAt = DateTime.UtcNow;
            idea.Student = null!;

            _context.StartupIdeas.Add(idea);
            await _context.SaveChangesAsync();

            return Ok(idea);
        }

        [Authorize]
        [HttpPut("ideas/{id}")]
        public async Task<IActionResult> UpdateStartupIdea(Guid id, [FromBody] StartupIdea updatedIdea)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student profile not found.");

            var idea = await _context.StartupIdeas.SingleOrDefaultAsync(i => i.Id == id && i.StudentId == student.Id);
            if (idea == null) return NotFound("Startup idea not found.");

            idea.Title = updatedIdea.Title;
            idea.Description = updatedIdea.Description;
            idea.TeamMembers = updatedIdea.TeamMembers;
            idea.Stage = updatedIdea.Stage;
            idea.FundingAsk = updatedIdea.FundingAsk;
            idea.MentorName = updatedIdea.MentorName;
            idea.PitchDeckUrl = updatedIdea.PitchDeckUrl;
            // Reset status to Pending when updated
            idea.Status = "Pending";

            await _context.SaveChangesAsync();
            return Ok(idea);
        }

        [Authorize]
        [HttpDelete("ideas/{id}")]
        public async Task<IActionResult> DeleteStartupIdea(Guid id)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student profile not found.");

            var idea = await _context.StartupIdeas.SingleOrDefaultAsync(i => i.Id == id && i.StudentId == student.Id);
            if (idea == null) return NotFound("Startup idea not found.");

            _context.StartupIdeas.Remove(idea);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Startup idea deleted successfully." });
        }
        #endregion

        #region Phase C: Notification Center
        [Authorize]
        [HttpGet("notifications")]
        public async Task<IActionResult> GetNotifications()
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student profile not found.");

            var notifications = await _context.Notifications
                .Where(n => n.StudentId == student.Id)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return Ok(notifications);
        }

        [Authorize]
        [HttpPut("notifications/{id}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student profile not found.");

            var notification = await _context.Notifications
                .SingleOrDefaultAsync(n => n.Id == id && n.StudentId == student.Id);
            if (notification == null) return NotFound("Notification not found.");

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return Ok(notification);
        }

        [Authorize]
        [HttpPut("notifications/read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student profile not found.");

            var notifications = await _context.Notifications
                .Where(n => n.StudentId == student.Id && !n.IsRead)
                .ToListAsync();

            foreach (var n in notifications)
            {
                n.IsRead = true;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "All notifications marked as read." });
        }

        [Authorize]
        [HttpDelete("notifications/{id}")]
        public async Task<IActionResult> DeleteNotification(Guid id)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student profile not found.");

            var notification = await _context.Notifications
                .SingleOrDefaultAsync(n => n.Id == id && n.StudentId == student.Id);
            if (notification == null) return NotFound("Notification not found.");

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Notification deleted successfully." });
        }
        #endregion

        #region Placement Portal Endpoints
        [Authorize]
        [HttpGet("placement/drives")]
        public async Task<IActionResult> GetStudentPlacementDrives()
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student profile not found.");

            // Fetch student projects, certifications, publications, achievements, communityServices to calculate completeness
            var fullStudent = await _context.Students
                .Include(s => s.Portfolio)
                .Include(s => s.Projects)
                .Include(s => s.Certifications)
                .Include(s => s.Publications)
                .Include(s => s.Achievements)
                .Include(s => s.CommunityServices)
                .SingleOrDefaultAsync(s => s.Id == student.Id);

            if (fullStudent == null) return NotFound("Student profile not found.");

            // Calculate profile completeness rate
            double completenessRate = 0;
            if (!string.IsNullOrEmpty(fullStudent.AvatarUrl)) completenessRate += 15;
            if (!string.IsNullOrEmpty(fullStudent.Bio)) completenessRate += 15;
            if (fullStudent.Portfolio != null && !string.IsNullOrEmpty(fullStudent.Portfolio.StatementOfPurpose)) completenessRate += 20;
            if (!string.IsNullOrEmpty(fullStudent.GithubUsername)) completenessRate += 10;
            if (fullStudent.Projects.Any()) completenessRate += 15;
            if (fullStudent.Certifications.Any()) completenessRate += 15;
            if (fullStudent.Achievements.Any() || fullStudent.CommunityServices.Any()) completenessRate += 10;

            var drives = await _context.PlacementDrives
                .OrderByDescending(d => d.DriveDate)
                .ToListAsync();

            var applications = await _context.JobApplications
                .Where(ja => ja.StudentId == fullStudent.Id)
                .ToDictionaryAsync(ja => ja.PlacementDriveId);

            var drivesResult = drives.Select(d => {
                bool applied = applications.TryGetValue(d.Id, out var ja);
                return new
                {
                    d.Id,
                    d.Title,
                    d.Description,
                    d.CompanyName,
                    d.EligibilityCgpa,
                    d.DriveDate,
                    d.ApplicationLink,
                    d.CreatedAt,
                    IsEligible = fullStudent.Cgpa >= d.EligibilityCgpa,
                    Applied = applied,
                    ApplicationStatus = applied ? ja!.Status : null,
                    ApplicationRemarks = applied ? ja!.Remarks : null,
                    AppliedAt = applied ? (DateTime?)ja!.AppliedAt : null
                };
            }).ToList();

            return Ok(new
            {
                CompletenessRate = completenessRate,
                Cgpa = fullStudent.Cgpa,
                IsPlacementReady = completenessRate >= 80 && fullStudent.Cgpa >= 8.0,
                Drives = drivesResult
            });
        }

        [Authorize]
        [HttpPost("placement/drives/{driveId}/apply")]
        public async Task<IActionResult> ApplyToPlacementDrive(Guid driveId)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student profile not found.");

            var drive = await _context.PlacementDrives.FindAsync(driveId);
            if (drive == null) return NotFound("Placement drive not found.");

            // Check if already applied
            var existingApp = await _context.JobApplications
                .SingleOrDefaultAsync(ja => ja.StudentId == student.Id && ja.PlacementDriveId == driveId);
            if (existingApp != null)
            {
                return BadRequest("You have already applied to this drive.");
            }

            // Validate eligibility: CGPA >= drive cutoff
            if (student.Cgpa < drive.EligibilityCgpa)
            {
                return BadRequest($"Your CGPA ({student.Cgpa}) does not meet the minimum requirement ({drive.EligibilityCgpa}) for this drive.");
            }

            // Create JobApplication
            var application = new JobApplication
            {
                Id = Guid.NewGuid(),
                StudentId = student.Id,
                PlacementDriveId = driveId,
                Status = "Applied",
                Remarks = string.Empty,
                AppliedAt = DateTime.UtcNow
            };
            _context.JobApplications.Add(application);

            // Dispatch in-app notification
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                StudentId = student.Id,
                Title = "Placement Application Submitted",
                Message = $"Successfully registered for '{drive.CompanyName} – {drive.Title}'. Your application is now 'Applied' and awaiting cell coordinator review.",
                IsRead = false,
                Type = "Placement",
                Link = "/dashboard/student",
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Application registered successfully.", application });
        }
        #endregion
    }
}
