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
    public class AcademicController : ControllerBase
    {
        private readonly MccDbContext _context;

        public AcademicController(MccDbContext context)
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
        public async Task<IActionResult> GetRecords()
        {
            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            var records = await _context.AcademicRecords
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.EndYear)
                .ToListAsync();

            return Ok(records);
        }

        [HttpPost]
        public async Task<IActionResult> CreateRecord([FromBody] AcademicRecordDto dto)
        {
            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            var record = new AcademicRecord
            {
                UserId = userId.Value,
                Degree = dto.Degree,
                Institution = dto.Institution,
                StartYear = dto.StartYear,
                EndYear = dto.EndYear,
                GradeOrCgpa = dto.GradeOrCgpa,
                Description = dto.Description,
                Level = dto.Level,
                IsCurrentlyStudying = dto.IsCurrentlyStudying
            };

            _context.AcademicRecords.Add(record);
            await _context.SaveChangesAsync();

            return StatusCode(201, record);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRecord(Guid id, [FromBody] AcademicRecordDto dto)
        {
            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            var record = await _context.AcademicRecords.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
            if (record == null)
                return NotFound(new { message = "Academic record not found" });

            record.Degree = dto.Degree;
            record.Institution = dto.Institution;
            record.StartYear = dto.StartYear;
            record.EndYear = dto.EndYear;
            record.GradeOrCgpa = dto.GradeOrCgpa;
            record.Description = dto.Description;
            record.Level = dto.Level;
            record.IsCurrentlyStudying = dto.IsCurrentlyStudying;

            await _context.SaveChangesAsync();
            return Ok(record);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRecord(Guid id)
        {
            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            var record = await _context.AcademicRecords.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
            if (record == null)
                return NotFound(new { message = "Academic record not found" });

            _context.AcademicRecords.Remove(record);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Academic record deleted successfully" });
        }
    }
}
