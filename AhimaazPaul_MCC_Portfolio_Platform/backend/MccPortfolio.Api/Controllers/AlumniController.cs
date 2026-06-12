using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MccPortfolio.Api.Data;
using MccPortfolio.Api.Entities;

namespace MccPortfolio.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AlumniController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AlumniController(AppDbContext context)
        {
            _context = context;
        }

        // ──────────────────────────────────────────────────────────────────────────
        // PUBLIC
        // ──────────────────────────────────────────────────────────────────────────

        /// <summary>Public alumni network — only verified records</summary>
        [AllowAnonymous]
        [HttpGet("public")]
        public async Task<IActionResult> GetPublicAlumni()
        {
            var alumni = await _context.AlumniRecords
                .Where(a => a.IsVerified)
                .OrderByDescending(a => a.GraduationYear)
                .Select(a => new
                {
                    a.Id,
                    a.Name,
                    a.GraduationYear,
                    a.Degree,
                    a.Department,
                    a.CurrentEmployer,
                    a.JobTitle,
                    a.LinkedInUrl,
                    a.City
                })
                .ToListAsync();

            return Ok(alumni);
        }

        // ──────────────────────────────────────────────────────────────────────────
        // ADMIN — Full CRUD
        // ──────────────────────────────────────────────────────────────────────────

        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllAlumni([FromQuery] string? department, [FromQuery] int? year)
        {
            var query = _context.AlumniRecords.AsQueryable();

            if (!string.IsNullOrWhiteSpace(department))
                query = query.Where(a => a.Department.Contains(department));

            if (year.HasValue)
                query = query.Where(a => a.GraduationYear == year.Value);

            var alumni = await query
                .OrderByDescending(a => a.GraduationYear)
                .ThenBy(a => a.Name)
                .Select(a => new
                {
                    a.Id,
                    a.Name,
                    a.Email,
                    a.RegistrationNumber,
                    a.GraduationYear,
                    a.Degree,
                    a.Department,
                    a.CurrentEmployer,
                    a.JobTitle,
                    a.LinkedInUrl,
                    a.City,
                    a.IsVerified,
                    a.CreatedAt
                })
                .ToListAsync();

            return Ok(alumni);
        }

        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateAlumni([FromBody] AlumniRequest req)
        {
            var alumni = new AlumniRecord
            {
                Name = req.Name,
                Email = req.Email,
                RegistrationNumber = req.RegistrationNumber ?? string.Empty,
                GraduationYear = req.GraduationYear,
                Degree = req.Degree ?? string.Empty,
                Department = req.Department ?? string.Empty,
                CurrentEmployer = req.CurrentEmployer ?? string.Empty,
                JobTitle = req.JobTitle ?? string.Empty,
                LinkedInUrl = req.LinkedInUrl ?? string.Empty,
                City = req.City ?? string.Empty,
                IsVerified = req.IsVerified
            };

            _context.AlumniRecords.Add(alumni);
            await _context.SaveChangesAsync();

            return Ok(alumni);
        }

        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAlumni(Guid id, [FromBody] AlumniRequest req)
        {
            var a = await _context.AlumniRecords.FindAsync(id);
            if (a == null) return NotFound();

            a.Name = req.Name;
            a.Email = req.Email;
            a.RegistrationNumber = req.RegistrationNumber ?? string.Empty;
            a.GraduationYear = req.GraduationYear;
            a.Degree = req.Degree ?? string.Empty;
            a.Department = req.Department ?? string.Empty;
            a.CurrentEmployer = req.CurrentEmployer ?? string.Empty;
            a.JobTitle = req.JobTitle ?? string.Empty;
            a.LinkedInUrl = req.LinkedInUrl ?? string.Empty;
            a.City = req.City ?? string.Empty;
            a.IsVerified = req.IsVerified;

            await _context.SaveChangesAsync();
            return Ok(a);
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAlumni(Guid id)
        {
            var a = await _context.AlumniRecords.FindAsync(id);
            if (a == null) return NotFound();

            _context.AlumniRecords.Remove(a);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }

        /// <summary>Stats for admin dashboard</summary>
        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var total = await _context.AlumniRecords.CountAsync();
            var verified = await _context.AlumniRecords.CountAsync(a => a.IsVerified);

            var topEmployers = await _context.AlumniRecords
                .Where(a => !string.IsNullOrEmpty(a.CurrentEmployer))
                .GroupBy(a => a.CurrentEmployer)
                .Select(g => new { Employer = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(5)
                .ToListAsync();

            var byYear = await _context.AlumniRecords
                .GroupBy(a => a.GraduationYear)
                .Select(g => new { Year = g.Key, Count = g.Count() })
                .OrderBy(x => x.Year)
                .ToListAsync();

            return Ok(new { total, verified, topEmployers, byYear });
        }
    }

    // ── DTO ──────────────────────────────────────────────────────────────────────

    public record AlumniRequest(
        string Name,
        string Email,
        string? RegistrationNumber,
        int GraduationYear,
        string? Degree,
        string? Department,
        string? CurrentEmployer,
        string? JobTitle,
        string? LinkedInUrl,
        string? City,
        bool IsVerified
    );
}
