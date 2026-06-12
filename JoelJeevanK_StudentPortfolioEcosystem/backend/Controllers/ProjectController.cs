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
    public class ProjectController : ControllerBase
    {
        private readonly MccDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ProjectController(MccDbContext context, IWebHostEnvironment env)
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
        public async Task<IActionResult> GetProjects()
        {
            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            var projects = await _context.Projects
                .Where(p => p.UserId == userId)
                .ToListAsync();

            return Ok(projects);
        }

        [HttpPost]
        public async Task<IActionResult> CreateProject([FromBody] ProjectDto dto)
        {
            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            var project = new Project
            {
                UserId = userId.Value,
                Title = dto.Title,
                Description = dto.Description,
                TechnologiesUsed = dto.TechnologiesUsed,
                ProjectUrl = dto.ProjectUrl,
                RepositoryUrl = dto.RepositoryUrl,
                MediaUrl = dto.MediaUrl
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return StatusCode(201, project);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProject(Guid id, [FromBody] ProjectDto dto)
        {
            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
            if (project == null)
                return NotFound(new { message = "Project not found" });

            project.Title = dto.Title;
            project.Description = dto.Description;
            project.TechnologiesUsed = dto.TechnologiesUsed;
            project.ProjectUrl = dto.ProjectUrl;
            project.RepositoryUrl = dto.RepositoryUrl;
            project.MediaUrl = dto.MediaUrl;

            await _context.SaveChangesAsync();
            return Ok(project);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(Guid id)
        {
            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
            if (project == null)
                return NotFound(new { message = "Project not found" });

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Project deleted successfully" });
        }

        [HttpPost("{id}/upload")]
        public async Task<IActionResult> UploadMedia(Guid id, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
            if (project == null)
                return NotFound(new { message = "Project not found" });

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".pdf", ".doc", ".docx" };
            var extension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Only image and document files (.jpg, .jpeg, .png, .gif, .pdf, .doc, .docx) are allowed" });

            var fileName = $"{id}_{DateTime.UtcNow.Ticks}{extension}";
            var folderPath = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "projects");
            var filePath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            project.MediaUrl = $"/uploads/projects/{fileName}";
            await _context.SaveChangesAsync();

            return Ok(new { mediaUrl = project.MediaUrl });
        }
    }
}
