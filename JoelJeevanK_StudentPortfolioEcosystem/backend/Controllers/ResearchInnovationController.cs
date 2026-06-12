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
    public class ResearchInnovationController : ControllerBase
    {
        private readonly MccDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ResearchInnovationController(MccDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
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
        public async Task<IActionResult> GetResearchInnovations()
        {
            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            var items = await _context.ResearchInnovations
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.Date)
                .ToListAsync();

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromForm] ResearchInnovationDto dto, IFormFile? attachment)
        {
            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            string attachmentPath = string.Empty;
            if (attachment != null && attachment.Length > 0)
            {
                var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png" };
                var extension = Path.GetExtension(attachment.FileName).ToLower();
                if (!allowedExtensions.Contains(extension))
                    return BadRequest(new { message = "Only PDF, Word documents, or image files are allowed" });

                var fileId = Guid.NewGuid();
                var fileName = $"{fileId}_{DateTime.UtcNow.Ticks}{extension}";
                var folderPath = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "researchinnovations");
                if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);
                var filePath = Path.Combine(folderPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await attachment.CopyToAsync(stream);
                }
                attachmentPath = $"/uploads/researchinnovations/{fileName}";
            }

            var item = new ResearchInnovation
            {
                UserId = userId.Value,
                Type = dto.Type,
                Title = dto.Title,
                Description = dto.Description,
                Category = dto.Category ?? string.Empty,
                Date = dto.Date,
                Link = dto.Link ?? string.Empty,
                AttachmentPath = attachmentPath,
                InstitutionOrEvent = dto.InstitutionOrEvent ?? string.Empty
            };

            _context.ResearchInnovations.Add(item);
            await _context.SaveChangesAsync();

            return StatusCode(201, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromForm] ResearchInnovationDto dto, IFormFile? attachment)
        {
            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            var item = await _context.ResearchInnovations.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
            if (item == null)
                return NotFound(new { message = "Item not found" });

            item.Type = dto.Type;
            item.Title = dto.Title;
            item.Description = dto.Description;
            item.Category = dto.Category ?? string.Empty;
            item.Date = dto.Date;
            item.Link = dto.Link ?? string.Empty;
            item.InstitutionOrEvent = dto.InstitutionOrEvent ?? string.Empty;

            if (attachment != null && attachment.Length > 0)
            {
                var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png" };
                var extension = Path.GetExtension(attachment.FileName).ToLower();
                if (!allowedExtensions.Contains(extension))
                    return BadRequest(new { message = "Only PDF, Word documents, or image files are allowed" });

                var fileId = Guid.NewGuid();
                var fileName = $"{fileId}_{DateTime.UtcNow.Ticks}{extension}";
                var folderPath = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "researchinnovations");
                if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);
                var filePath = Path.Combine(folderPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await attachment.CopyToAsync(stream);
                }
                item.AttachmentPath = $"/uploads/researchinnovations/{fileName}";
            }

            await _context.SaveChangesAsync();
            return Ok(item);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            var item = await _context.ResearchInnovations.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
            if (item == null)
                return NotFound(new { message = "Item not found" });

            _context.ResearchInnovations.Remove(item);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Research/Innovation record deleted successfully" });
        }
    }
}
