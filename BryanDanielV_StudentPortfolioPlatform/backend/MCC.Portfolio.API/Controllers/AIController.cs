using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MCC.Portfolio.API.Data;
using MCC.Portfolio.API.Models;
using MCC.Portfolio.API.Services;

namespace MCC.Portfolio.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AIController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly AIService _aiService;

        public AIController(AppDbContext context, AIService aiService)
        {
            _context = context;
            _aiService = aiService;
        }

        private async Task<Student?> GetCurrentStudentAsync()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("nameid");
            if (claim == null || !Guid.TryParse(claim.Value, out Guid userId))
            {
                return null;
            }
            return await _context.Students
                .Include(s => s.Projects)
                .Include(s => s.Certifications)
                .Include(s => s.Publications)
                .Include(s => s.Achievements)
                .Include(s => s.CommunityServices)
                .Include(s => s.Portfolio)
                .SingleOrDefaultAsync(s => s.UserId == userId);
        }

        public class SopRequest
        {
            public string Prompt { get; set; } = string.Empty;
        }

        public class CareerRoadmapRequest
        {
            public string TargetRole { get; set; } = "Full Stack Developer";
        }

        [HttpPost("career-roadmap")]
        public async Task<IActionResult> GetCareerRoadmap([FromBody] CareerRoadmapRequest request)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            var roadmap = _aiService.GetCareerRoadmap(student, request.TargetRole);
            return Ok(roadmap);
        }

        [HttpPost("generate-sop")]
        public async Task<IActionResult> GenerateSop([FromBody] SopRequest request)
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            var sop = _aiService.GenerateSOP(student, request.Prompt);
            return Ok(new { sop });
        }

        [HttpGet("resume-critique")]
        public async Task<IActionResult> GetResumeCritique()
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            var critique = _aiService.GetResumeCritique(student);
            return Ok(critique);
        }

        [HttpGet("career-guidance")]
        public async Task<IActionResult> GetCareerGuidance()
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            var guidance = _aiService.GetCareerGuidance(student);
            return Ok(guidance);
        }

        [HttpGet("university-matches")]
        public async Task<IActionResult> GetUniversityMatches()
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            var colleges = _aiService.GetUniversityRecommendations(student);
            return Ok(colleges);
        }

        [HttpGet("internship-matches")]
        public async Task<IActionResult> GetInternshipMatches()
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            var internships = _aiService.GetInternshipRecommendations(student);
            return Ok(internships);
        }

        [HttpGet("scholarships")]
        public async Task<IActionResult> GetScholarships()
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            var scholarships = _aiService.GetScholarshipRecommendations(student);
            return Ok(scholarships);
        }

        [HttpGet("portfolio-suggestions")]
        public async Task<IActionResult> GetPortfolioSuggestions()
        {
            var student = await GetCurrentStudentAsync();
            if (student == null) return NotFound("Student not found.");

            var suggestions = _aiService.GetPortfolioSuggestions(student);
            return Ok(suggestions);
        }
    }
}
