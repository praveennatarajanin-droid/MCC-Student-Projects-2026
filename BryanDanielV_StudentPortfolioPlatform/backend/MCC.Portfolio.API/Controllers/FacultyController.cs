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
    [Authorize(Roles = "Admin,Faculty,PlacementCoordinator,ResearchCoordinator,InnovationCoordinator")]
    [ApiController]
    [Route("api/[controller]")]
    public class FacultyController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FacultyController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("students")]
        public async Task<IActionResult> GetStudents()
        {
            var students = await _context.Students
                .Include(s => s.Portfolio)
                .OrderBy(s => s.RollNumber)
                .Select(s => new
                {
                    s.Id,
                    s.FirstName,
                    s.LastName,
                    s.RollNumber,
                    s.Department,
                    s.BatchYear,
                    s.Cgpa,
                    Portfolio = s.Portfolio != null ? new
                    {
                        s.Portfolio.Id,
                        s.Portfolio.Slug,
                        s.Portfolio.IsPublic,
                        s.Portfolio.IsApproved,
                        s.Portfolio.ReviewRemarks,
                        s.Portfolio.ReviewedBy
                    } : null
                })
                .ToListAsync();

            return Ok(students);
        }

        [HttpGet("students/{id}")]
        public async Task<IActionResult> GetStudentDetails(Guid id)
        {
            var student = await _context.Students
                .Include(s => s.Portfolio)
                .Include(s => s.Projects)
                .Include(s => s.Certifications)
                .Include(s => s.Publications)
                .Include(s => s.Achievements)
                .Include(s => s.CommunityServices)
                .SingleOrDefaultAsync(s => s.Id == id);

            if (student == null) return NotFound("Student not found.");

            return Ok(new
            {
                Profile = new
                {
                    student.Id,
                    student.RollNumber,
                    student.FirstName,
                    student.LastName,
                    student.Department,
                    student.BatchYear,
                    student.Bio,
                    student.AvatarUrl,
                    student.GithubUsername,
                    student.BehanceUsername,
                    student.Cgpa
                },
                Portfolio = student.Portfolio != null ? new
                {
                    student.Portfolio.Id,
                    student.Portfolio.Slug,
                    student.Portfolio.IsPublic,
                    student.Portfolio.IsApproved,
                    student.Portfolio.StatementOfPurpose,
                    student.Portfolio.StoryTitle,
                    student.Portfolio.StoryContent,
                    student.Portfolio.ReviewRemarks,
                    student.Portfolio.ReviewedBy,
                    student.Portfolio.LayoutSettingsJson
                } : null,
                Projects = student.Projects.OrderByDescending(p => p.CreatedAt).ToList(),
                Certifications = student.Certifications.OrderByDescending(c => c.IssueDate).ToList(),
                Publications = student.Publications.OrderByDescending(p => p.PublishDate).ToList(),
                Achievements = student.Achievements.OrderByDescending(a => a.DateEarned).ToList(),
                CommunityServices = student.CommunityServices.OrderByDescending(c => c.StartDate).ToList()
            });
        }

        public class PortfolioReviewDto
        {
            public bool Approve { get; set; }
            public string Remarks { get; set; } = string.Empty;
        }

        [HttpPut("portfolios/{id}/review")]
        public async Task<IActionResult> ReviewPortfolio(Guid id, [FromBody] PortfolioReviewDto dto)
        {
            var portfolio = await _context.Portfolios
                .Include(p => p.Student)
                .SingleOrDefaultAsync(p => p.Id == id);

            if (portfolio == null) return NotFound("Portfolio config not found.");

            var reviewerEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? 
                                User.FindFirst(ClaimTypes.Name)?.Value ?? 
                                "Faculty Reviewer";

            portfolio.IsApproved = dto.Approve;
            portfolio.ReviewRemarks = dto.Remarks;
            portfolio.ReviewedBy = reviewerEmail;

            // Dispatch notification to the student's inbox
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                StudentId = portfolio.StudentId,
                Title = dto.Approve ? "Portfolio Approved!" : "Portfolio Revisions Requested",
                Message = dto.Approve 
                    ? $"Your public student portfolio was approved by {reviewerEmail}." 
                    : $"The faculty {reviewerEmail} requested revisions on your portfolio. Feedback: {dto.Remarks}",
                IsRead = false,
                Type = "System",
                Link = "/dashboard/student",
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return Ok(new 
            { 
                message = $"Portfolio successfully {(dto.Approve ? "approved" : "flagged for revision")}.", 
                isApproved = portfolio.IsApproved 
            });
        }
    }
}
