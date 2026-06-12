using System;
using System.Linq;
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
    [AllowAnonymous]
    public class PublicListController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PublicListController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("students")]
        public async Task<IActionResult> GetPublicStudents()
        {
            var students = await _context.StudentProfiles
                .Include(sp => sp.User)
                .Include(sp => sp.Projects)
                .Include(sp => sp.Certifications)
                .Include(sp => sp.ResearchPapers)
                .Include(sp => sp.Hackathons)
                .Include(sp => sp.Achievements)
                .Include(sp => sp.CommunityServices)
                .Include(sp => sp.CreativeWorks)
                .Where(sp => sp.Approved && sp.User != null && sp.User.Role == "Student")
                .Select(sp => new
                {
                    sp.Id,
                    Username = sp.User != null ? sp.User.Username : string.Empty,
                    sp.FullName,
                    sp.Department,
                    sp.Theme,
                    sp.AvatarUrl,
                    sp.GithubUrl,
                    sp.BehanceUrl,
                    sp.Bio,
                    ProjectCount = sp.Projects.Count,
                    CertCount = sp.Certifications.Count,
                    ResearchCount = sp.ResearchPapers.Count,
                    HackathonCount = sp.Hackathons.Count,
                    AchievementCount = sp.Achievements.Count,
                    CommunityCount = sp.CommunityServices.Count,
                    CreativeCount = sp.CreativeWorks.Count,
                    Skills = sp.Projects.Select(p => p.TechStack).ToList()
                })
                .ToListAsync();

            return Ok(students);
        }
    }
}
