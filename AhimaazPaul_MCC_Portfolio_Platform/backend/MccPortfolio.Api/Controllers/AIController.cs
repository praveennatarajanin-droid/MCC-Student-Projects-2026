using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
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
    public class AIController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IAISuggestionService _aiService;

        public AIController(AppDbContext context, IAISuggestionService aiService)
        {
            _context = context;
            _aiService = aiService;
        }

        private Guid GetUserId()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdStr, out Guid userId) ? userId : Guid.Empty;
        }

        private async Task<StudentProfile> GetStudentProfileAsync()
        {
            var userId = GetUserId();
            var profile = await _context.StudentProfiles
                .Include(p => p.User)
                .Include(p => p.Department)
                .Include(p => p.Projects)
                .Include(p => p.Certifications)
                .Include(p => p.Hackathons)
                .Include(p => p.ResearchPapers)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
                throw new KeyNotFoundException("Student profile not found.");

            return profile;
        }

        // ─── SOP Generator ────────────────────────────────────────────────────────

        [HttpPost("sop")]
        public async Task<IActionResult> GenerateSop([FromBody] SopRequest request)
        {
            try
            {
                var profile = await GetStudentProfileAsync();
                var projectTitles = string.Join("; ", profile.Projects.Select(p => p.Title));

                var sopText = _aiService.GenerateSop(
                    profile.User!.Name,
                    profile.Department!.Name,
                    request.FocusArea,
                    request.CareerGoals,
                    profile.Skills,
                    projectTitles
                );

                _context.AISuggestions.Add(new AISuggestion
                {
                    StudentProfileId = profile.Id,
                    Type = "SOP",
                    PromptText = $"Focus: {request.FocusArea} | Goals: {request.CareerGoals}",
                    GeneratedText = sopText
                });
                await _context.SaveChangesAsync();

                return Ok(new { sop = sopText });
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ─── Resume Review ────────────────────────────────────────────────────────

        [HttpPost("resume-review")]
        public async Task<IActionResult> ReviewResume()
        {
            try
            {
                var profile = await GetStudentProfileAsync();
                var projectTitles = string.Join("; ", profile.Projects.Select(p => p.Title));
                var certsList = string.Join("; ", profile.Certifications.Select(c => c.Name));

                var suggestionsList = _aiService.GetResumeSuggestions(
                    profile.Bio, profile.Skills, projectTitles, certsList
                );

                var generatedText = string.Join("\n", suggestionsList);
                _context.AISuggestions.Add(new AISuggestion
                {
                    StudentProfileId = profile.Id,
                    Type = "Resume",
                    PromptText = "Self-triggered resume review",
                    GeneratedText = generatedText
                });
                await _context.SaveChangesAsync();

                int score = 10;
                if (!string.IsNullOrEmpty(profile.Bio) && profile.Bio.Length > 50) score += 15;
                if (!string.IsNullOrEmpty(profile.Skills) && profile.Skills.Split(';').Length >= 5) score += 20;
                if (profile.Projects.Count >= 2) score += 25;
                if (profile.Certifications.Count >= 1) score += 15;
                if (!string.IsNullOrEmpty(profile.ResumeUrl)) score += 10;
                if (!string.IsNullOrEmpty(profile.StatementOfPurpose)) score += 5;

                return Ok(new { score, suggestions = suggestionsList });
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ─── Career Guidance ──────────────────────────────────────────────────────

        [HttpPost("career-guidance")]
        public async Task<IActionResult> GetCareerGuidance()
        {
            try
            {
                var profile = await GetStudentProfileAsync();
                var guidanceText = _aiService.GetCareerRecommendations(
                    profile.Department!.Name, profile.Skills, profile.Bio
                );

                _context.AISuggestions.Add(new AISuggestion
                {
                    StudentProfileId = profile.Id,
                    Type = "Career",
                    PromptText = "Career path recommendations",
                    GeneratedText = guidanceText
                });
                await _context.SaveChangesAsync();

                return Ok(new { guidance = guidanceText });
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ─── Portfolio Improvements ────────────────────────────────────────────────

        [HttpPost("portfolio-improvements")]
        public async Task<IActionResult> GetPortfolioImprovements()
        {
            try
            {
                var profile = await GetStudentProfileAsync();

                var improvements = _aiService.GetPortfolioImprovements(
                    profile.Bio,
                    profile.Headline,
                    profile.Skills,
                    profile.Projects.Count,
                    profile.Certifications.Count,
                    profile.Hackathons.Count,
                    profile.ResearchPapers.Count,
                    !string.IsNullOrEmpty(profile.StatementOfPurpose),
                    !string.IsNullOrEmpty(profile.ResumeUrl)
                );

                _context.AISuggestions.Add(new AISuggestion
                {
                    StudentProfileId = profile.Id,
                    Type = "Portfolio",
                    PromptText = "Portfolio improvement analysis",
                    GeneratedText = string.Join("\n", improvements)
                });
                await _context.SaveChangesAsync();

                return Ok(new { improvements });
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ─── University Recommendations ────────────────────────────────────────────

        [HttpPost("university-recommendations")]
        public async Task<IActionResult> GetUniversityRecommendations([FromBody] UniversityRequest request)
        {
            try
            {
                var profile = await GetStudentProfileAsync();

                // Try parse CGPA from first academic record
                double cgpa = 7.5;
                if (!string.IsNullOrEmpty(profile.AcademicRecordsJson))
                {
                    try
                    {
                        var records = System.Text.Json.JsonSerializer.Deserialize<List<System.Text.Json.JsonElement>>(profile.AcademicRecordsJson);
                        if (records != null && records.Count > 0 && records[0].TryGetProperty("cgpa", out var cgpaProp))
                            double.TryParse(cgpaProp.GetString(), out cgpa);
                    }
                    catch { }
                }

                var results = _aiService.GetUniversityRecommendations(
                    profile.Department!.Name,
                    profile.Skills,
                    request.CareerGoal,
                    cgpa
                );

                _context.AISuggestions.Add(new AISuggestion
                {
                    StudentProfileId = profile.Id,
                    Type = "University",
                    PromptText = $"Career goal: {request.CareerGoal}",
                    GeneratedText = string.Join("\n", results.Select(r => $"{r.Name} ({r.Country}) – {r.Program}"))
                });
                await _context.SaveChangesAsync();

                return Ok(new { universities = results });
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ─── Internship Matching ───────────────────────────────────────────────────

        [HttpPost("internship-matches")]
        public async Task<IActionResult> GetInternshipMatches()
        {
            try
            {
                var profile = await GetStudentProfileAsync();

                var matches = _aiService.GetInternshipMatches(
                    profile.Department!.Name,
                    profile.Skills,
                    profile.Headline
                );

                _context.AISuggestions.Add(new AISuggestion
                {
                    StudentProfileId = profile.Id,
                    Type = "Internship",
                    PromptText = "Internship match request",
                    GeneratedText = string.Join("\n", matches.Select(m => $"{m.Company} – {m.Role} ({m.MatchPercent}% match)"))
                });
                await _context.SaveChangesAsync();

                return Ok(new { matches });
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ─── Scholarship Suggestions ───────────────────────────────────────────────

        [HttpPost("scholarships")]
        public async Task<IActionResult> GetScholarshipSuggestions()
        {
            try
            {
                var profile = await GetStudentProfileAsync();

                double cgpa = 7.5;
                if (!string.IsNullOrEmpty(profile.AcademicRecordsJson))
                {
                    try
                    {
                        var records = System.Text.Json.JsonSerializer.Deserialize<List<System.Text.Json.JsonElement>>(profile.AcademicRecordsJson);
                        if (records != null && records.Count > 0 && records[0].TryGetProperty("cgpa", out var cgpaProp))
                            double.TryParse(cgpaProp.GetString(), out cgpa);
                    }
                    catch { }
                }

                var scholarships = _aiService.GetScholarshipSuggestions(
                    profile.Department!.Name,
                    profile.Skills,
                    cgpa,
                    profile.Bio
                );

                _context.AISuggestions.Add(new AISuggestion
                {
                    StudentProfileId = profile.Id,
                    Type = "Scholarship",
                    PromptText = "Scholarship match request",
                    GeneratedText = string.Join("\n", scholarships.Select(s => $"{s.Name} – {s.Amount}"))
                });
                await _context.SaveChangesAsync();

                return Ok(new { scholarships });
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ─── AI History ────────────────────────────────────────────────────────────

        [HttpGet("history")]
        public async Task<IActionResult> GetAIHistory()
        {
            try
            {
                var profile = await GetStudentProfileAsync();
                var history = await _context.AISuggestions
                    .Where(s => s.StudentProfileId == profile.Id)
                    .OrderByDescending(s => s.CreatedAt)
                    .ToListAsync();
                return Ok(history);
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }
    }

    // ─── Request DTOs ──────────────────────────────────────────────────────────

    public class SopRequest
    {
        public string FocusArea { get; set; } = string.Empty;
        public string CareerGoals { get; set; } = string.Empty;
    }

    public class UniversityRequest
    {
        public string CareerGoal { get; set; } = string.Empty;
    }
}
