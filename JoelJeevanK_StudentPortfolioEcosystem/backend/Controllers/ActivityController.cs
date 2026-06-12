using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MccPortfolioBackend.Data;
using MccPortfolioBackend.Models;
using MccPortfolioBackend.DTOs;

using Microsoft.AspNetCore.Authorization;

namespace MccPortfolioBackend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ActivityController : ControllerBase
    {
        private readonly MccDbContext _context;

        public ActivityController(MccDbContext context)
        {
            _context = context;
        }

        private Guid? GetRequestUserId()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }
            if (Request.Headers.TryGetValue("X-User-Id", out var userIdStr) && Guid.TryParse(userIdStr, out var legacyUserId))
            {
                return legacyUserId;
            }
            return null;
        }

        [HttpGet]
        public async Task<IActionResult> GetActivities()
        {
            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            var activities = await _context.Activities
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.StartDate)
                .ToListAsync();

            return Ok(activities);
        }

        [HttpPost]
        public async Task<IActionResult> CreateActivity([FromBody] ActivityDto dto)
        {
            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            var activity = new Activity
            {
                UserId = userId.Value,
                Type = dto.Type,
                Title = dto.Title,
                Organization = dto.Organization,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Description = dto.Description ?? string.Empty
            };

            _context.Activities.Add(activity);
            await _context.SaveChangesAsync();

            return StatusCode(201, activity);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateActivity(Guid id, [FromBody] ActivityDto dto)
        {
            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            var activity = await _context.Activities.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
            if (activity == null)
                return NotFound(new { message = "Activity not found" });

            activity.Type = dto.Type;
            activity.Title = dto.Title;
            activity.Organization = dto.Organization;
            activity.StartDate = dto.StartDate;
            activity.EndDate = dto.EndDate;
            activity.Description = dto.Description ?? string.Empty;

            await _context.SaveChangesAsync();
            return Ok(activity);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteActivity(Guid id)
        {
            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            var activity = await _context.Activities.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
            if (activity == null)
                return NotFound(new { message = "Activity not found" });

            _context.Activities.Remove(activity);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Activity deleted successfully" });
        }
    }
}
