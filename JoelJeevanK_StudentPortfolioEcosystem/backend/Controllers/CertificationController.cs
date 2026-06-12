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
    public class CertificationController : ControllerBase
    {
        private readonly MccDbContext _context;
        private readonly IWebHostEnvironment _env;

        public CertificationController(MccDbContext context, IWebHostEnvironment env)
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
        public async Task<IActionResult> GetCertifications()
        {
            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            var certs = await _context.Certifications
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.IssueDate)
                .ToListAsync();

            return Ok(certs);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCertification([FromForm] CertificationDto dto, List<IFormFile>? photos)
        {
            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            var savedPhotos = new List<string>();
            if (photos != null && photos.Count > 0)
            {
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                foreach (var photo in photos)
                {
                    if (photo.Length == 0) continue;
                    var extension = Path.GetExtension(photo.FileName).ToLower();
                    if (!allowedExtensions.Contains(extension))
                        return BadRequest(new { message = "Only image files (.jpg, .jpeg, .png) are allowed" });

                    var photoId = Guid.NewGuid();
                    var fileName = $"{photoId}_{DateTime.UtcNow.Ticks}{extension}";
                    var folderPath = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "certifications");
                    if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);
                    var filePath = Path.Combine(folderPath, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await photo.CopyToAsync(stream);
                    }
                    savedPhotos.Add($"/uploads/certifications/{fileName}");
                }
            }

            var cert = new Certification
            {
                UserId = userId.Value,
                Name = dto.Name,
                IssuingOrganization = dto.IssuingOrganization,
                IssueDate = dto.IssueDate,
                CredentialId = dto.CredentialId ?? string.Empty,
                CertificatePhotos = string.Join(",", savedPhotos)
            };

            _context.Certifications.Add(cert);
            await _context.SaveChangesAsync();

            return StatusCode(201, cert);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCertification(Guid id, [FromForm] CertificationDto dto, List<IFormFile>? photos)
        {
            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            var cert = await _context.Certifications.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
            if (cert == null)
                return NotFound(new { message = "Certification not found" });

            cert.Name = dto.Name;
            cert.IssuingOrganization = dto.IssuingOrganization;
            cert.IssueDate = dto.IssueDate;
            cert.CredentialId = dto.CredentialId ?? string.Empty;

            if (photos != null && photos.Count > 0)
            {
                var savedPhotos = new List<string>();
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                foreach (var photo in photos)
                {
                    if (photo.Length == 0) continue;
                    var extension = Path.GetExtension(photo.FileName).ToLower();
                    if (!allowedExtensions.Contains(extension))
                        return BadRequest(new { message = "Only image files (.jpg, .jpeg, .png) are allowed" });

                    var photoId = Guid.NewGuid();
                    var fileName = $"{photoId}_{DateTime.UtcNow.Ticks}{extension}";
                    var folderPath = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "certifications");
                    if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);
                    var filePath = Path.Combine(folderPath, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await photo.CopyToAsync(stream);
                    }
                    savedPhotos.Add($"/uploads/certifications/{fileName}");
                }
                cert.CertificatePhotos = string.Join(",", savedPhotos);
            }

            await _context.SaveChangesAsync();
            return Ok(cert);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCertification(Guid id)
        {
            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            var cert = await _context.Certifications.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
            if (cert == null)
                return NotFound(new { message = "Certification not found" });

            _context.Certifications.Remove(cert);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Certification deleted successfully" });
        }

        [HttpPost("{id}/upload")]
        public async Task<IActionResult> UploadAttachment(Guid id, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            var userId = GetRequestUserId();
            if (userId == null)
                return Unauthorized(new { message = "Unauthorized access" });

            var cert = await _context.Certifications.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
            if (cert == null)
                return NotFound(new { message = "Certification not found" });

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf" };
            var extension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Only image files (.jpg, .jpeg, .png) or PDFs are allowed" });

            var fileName = $"{id}_{DateTime.UtcNow.Ticks}{extension}";
            var folderPath = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "certifications");
            var filePath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            cert.CertificatePhotos = $"/uploads/certifications/{fileName}";
            await _context.SaveChangesAsync();

            return Ok(new { attachmentPath = cert.CertificatePhotos });
        }
    }
}
