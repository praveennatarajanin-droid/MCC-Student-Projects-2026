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
    public class AIController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AIController(AppDbContext context)
        {
            _context = context;
        }

        private async Task<StudentProfile?> GetCurrentStudentProfileAsync()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return null;
            var userId = int.Parse(userIdClaim.Value);

            return await _context.StudentProfiles
                .Include(sp => sp.Projects)
                .Include(sp => sp.Certifications)
                .Include(sp => sp.ResearchPapers)
                .Include(sp => sp.Achievements)
                .Include(sp => sp.Hackathons)
                .Include(sp => sp.CreativeWorks)
                .FirstOrDefaultAsync(sp => sp.UserId == userId);
        }

        public class SopRequestDto
        {
            public string TargetGoal { get; set; } = string.Empty; // e.g. "Master's in CS", "Software Engineer Job at Google"
            public string Tone { get; set; } = "Professional"; // Professional, Bold, Academic, Creative
        }

        [HttpPost("generate-sop")]
        public async Task<IActionResult> GenerateSOP([FromBody] SopRequestDto dto)
        {
            var profile = await GetCurrentStudentProfileAsync();
            if (profile == null) return NotFound(new { message = "Profile not found." });

            var projectsList = string.Join(", ", profile.Projects.Select(p => p.Title));
            var certsList = string.Join(", ", profile.Certifications.Select(c => c.Name));
            var researchList = string.Join(", ", profile.ResearchPapers.Select(r => r.Title));
            var creativeList = string.Join(", ", profile.CreativeWorks.Select(c => c.Title));

            // High-fidelity local simulation of an LLM generating an SOP based on profile details
            var sop = $@"STATEMENT OF PURPOSE

Dear Admissions / Hiring Committee,

I am writing to express my strong candidacy for my target goal of pursuing a {dto.TargetGoal}. As a student of Madras Christian College (MCC) in the department of {profile.Department ?? "Computer Science"}, my academic journey and technical endeavors have prepared me well for this next chapter.

Throughout my college career, I have dedicated myself to mastering the core foundations of my field. My hands-on projects, including {(profile.Projects.Any() ? projectsList : "advanced development projects")}, demonstrate my practical ability to design and build scalable systems. These experiences have taught me how to bridge theory with application, analyzing complex problems and delivering robust solutions.

{(profile.Certifications.Any() ? $"Additionally, I have pursued professional validation of my skills through certifications in {certsList}. These programs have given me a structured understanding of industry standards and emerging frameworks." : "")}

{(profile.ResearchPapers.Any() ? $"On the research front, my inquiry into topics like {researchList} has allowed me to contribute to academic literature, strengthening my critical reading, writing, and empirical investigation capabilities." : "")}

{(profile.CreativeWorks.Any() ? $"Furthermore, my creative works including {creativeList} demonstrate my multi-disciplinary capabilities and eye for user-centered presentation." : "")}

In terms of career aspirations, my immediate objective is to leverage my academic background at MCC to make a significant impact in the domain of {dto.TargetGoal}. I choose this path with a clear {dto.Tone.ToLower()} focus, seeking to push boundaries and collaborate with leading minds. 

Thank you for your time and consideration.

Sincerely,
{profile.FullName}
Department of {profile.Department ?? "MCC Student"}
Madras Christian College";

            return Ok(new { sop });
        }

        [HttpGet("resume-suggestions")]
        public async Task<IActionResult> GetResumeSuggestions()
        {
            var profile = await GetCurrentStudentProfileAsync();
            if (profile == null) return NotFound();

            // Local analysis rules simulating AI resume screening
            int score = 30;
            var suggestions = new System.Collections.Generic.List<string>();

            if (!string.IsNullOrEmpty(profile.Bio)) { score += 10; } else { suggestions.Add("Add a compelling professional bio summarizing your career interests."); }
            if (profile.Projects.Count >= 2) { score += 20; } else { suggestions.Add("Add at least 2 detailed coding projects to highlight technical skills."); }
            if (profile.Certifications.Any()) { score += 10; } else { suggestions.Add("Include industry certifications to validate your skill set."); }
            if (profile.ResearchPapers.Any()) { score += 10; } else { suggestions.Add("If applicable, add research publications to stand out for academic applications."); }
            if (profile.Hackathons.Any()) { score += 10; } else { suggestions.Add("Participate in and list hackathons to show teamwork and rapid prototyping abilities."); }
            if (profile.CreativeWorks.Any()) { score += 10; } else { suggestions.Add("Include creative design mockups, art, or UI media to show multi-disciplinary versatility."); }
            if (!string.IsNullOrEmpty(profile.GithubUrl)) { score += 10; } else { suggestions.Add("Add your GitHub profile URL to provide code visibility."); }

            // Ensure score maxes out at 100
            score = Math.Min(score, 100);

            var feedback = score switch
            {
                >= 85 => "Excellent! Your portfolio represents a highly competitive profile ready for internships and university applications.",
                >= 60 => "Good profile foundation. Actioning the recommendations below will significantly improve your competitiveness.",
                _ => "Your portfolio is in its early stages. Fill out missing modules to improve visibility and career readiness."
            };

            return Ok(new
            {
                portfolioScore = score,
                feedbackSummary = feedback,
                recommendations = suggestions
            });
        }

        [HttpGet("career-recommendations")]
        public async Task<IActionResult> GetCareerRecommendations()
        {
            var profile = await GetCurrentStudentProfileAsync();
            if (profile == null) return NotFound();

            // Dynamic rule engine to suggest paths based on student projects/skills
            string suggestedRole = "Software Engineer (Full Stack)";
            string rationale = "Based on your project work and technical background at Madras Christian College.";
            string[] skillsToLearn = new[] { "Docker", "Kubernetes", "System Design Patterns", "Advanced TypeScript" };
            string[] suggestedScholarships = new[] { "MCC Alumni Merit Scholarship", "Erasmus Mundus Joint Masters", "Commonwealth Scholarships" };
            string[] suggestedUniversities = new[] { "National University of Singapore (NUS)", "Technical University of Munich (TUM)", "Carnegie Mellon University (CMU)" };

            var allTech = string.Join(" ", profile.Projects.Select(p => p.TechStack)).ToLower();

            if (profile.CreativeWorks.Any() || !string.IsNullOrEmpty(profile.BehanceUrl))
            {
                suggestedRole = "Creative Technologist / UI-UX Designer";
                rationale = "Your portfolio contains custom design portfolios or a Behance connection, showcasing visual presentation skills.";
                skillsToLearn = new[] { "Figma & Design Systems", "Framer Motion animations", "3D Rendering (Blender/Three.js)", "User Research & Heuristic Evaluation" };
            }
            else if (allTech.Contains("data") || allTech.Contains("python") || allTech.Contains("machine") || allTech.Contains("ai"))
            {
                suggestedRole = "Data Scientist / AI Engineer";
                rationale = "Your portfolio shows experience with data processing, Python, or machine learning libraries.";
                skillsToLearn = new[] { "PyTorch / TensorFlow", "MLOps (MLflow, Kubeflow)", "Apache Spark", "SQL and BigQuery" };
            }
            else if (allTech.Contains("react") || allTech.Contains("next") || allTech.Contains("tailwind") || allTech.Contains("html") || allTech.Contains("css"))
            {
                suggestedRole = "Frontend Architect / UI Developer";
                rationale = "Your projects focus heavily on user experience, modern frontend libraries (React, Next.js), and CSS styling.";
                skillsToLearn = new[] { "Next.js App Router optimization", "Figma Design Systems", "Web Performance & Core Web Vitals", "Three.js / WebGL" };
            }
            else if (allTech.Contains("asp") || allTech.Contains("c#") || allTech.Contains("postgres") || allTech.Contains("sql") || allTech.Contains("java") || allTech.Contains("spring"))
            {
                suggestedRole = "Backend Engineer / Cloud Architect";
                rationale = "Your project list highlights server-side infrastructure, database management (PostgreSQL/SQL), or C# Web APIs.";
                skillsToLearn = new[] { "Microservices Architecture", "Redis Caching", "AWS / Azure Fundamentals", "gRPC and WebSockets" };
            }

            return Ok(new
            {
                recommendedRole = suggestedRole,
                rationale,
                skillsGap = skillsToLearn,
                suggestedUniversities,
                suggestedScholarships
            });
        }
    }
}
