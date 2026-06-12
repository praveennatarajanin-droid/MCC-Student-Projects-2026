using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MccPortfolio.Api.Data;

namespace MccPortfolio.Api.Controllers
{
    [ApiController]
    [Route("api/public")]
    public class PublicPortfolioController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PublicPortfolioController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("student/{usernameSlug}")]
        public async Task<IActionResult> GetPublicPortfolio(string usernameSlug)
        {
            var slug = usernameSlug.ToLower().Trim();
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
                .FirstOrDefaultAsync(p => p.UsernameSlug == slug);

            if (profile == null)
            {
                return NotFound(new { message = "Portfolio not found." });
            }

            return Ok(profile);
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchPortfolios([FromQuery] string? query = null)
        {
            var q = (query ?? "").ToLower().Trim();
            
            var queryable = _context.StudentProfiles
                .Include(p => p.User)
                .Include(p => p.Department)
                .Where(p => p.IsApproved);

            if (!string.IsNullOrEmpty(q))
            {
                queryable = queryable.Where(p => 
                    p.User!.Name.ToLower().Contains(q) || 
                    p.Skills.ToLower().Contains(q) ||
                    p.Department!.Name.ToLower().Contains(q)
                );
            }

            var results = await queryable
                .Select(p => new {
                    p.Id,
                    p.User!.Name,
                    p.User!.Email,
                    DepartmentName = p.Department!.Name,
                    p.Headline,
                    p.Bio,
                    p.Skills,
                    p.UsernameSlug,
                    p.Theme
                })
                .ToListAsync();

            return Ok(results);
        }
    }
}
