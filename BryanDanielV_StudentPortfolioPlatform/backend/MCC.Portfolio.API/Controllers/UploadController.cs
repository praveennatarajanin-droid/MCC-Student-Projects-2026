using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MCC.Portfolio.API.Services;

namespace MCC.Portfolio.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        private readonly IStorageService _storageService;

        public UploadController(IStorageService storageService)
        {
            _storageService = storageService;
        }

        [HttpPost]
        public async Task<IActionResult> UploadFile(IFormFile file, [FromForm] string folder = "general")
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file was uploaded.");
                }

                // Restrict file formats if necessary (e.g., images and pdfs)
                var fileExtension = System.IO.Path.GetExtension(file.FileName).ToLower();
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".pdf", ".doc", ".docx" };
                
                if (!System.Linq.Enumerable.Contains(allowedExtensions, fileExtension))
                {
                    return BadRequest("Unsupported file format. Supported extensions: jpg, jpeg, png, gif, pdf, doc, docx.");
                }

                // Restrict file size (e.g., 5MB max)
                if (file.Length > 5 * 1024 * 1024)
                {
                    return BadRequest("File size exceeds the limit of 5MB.");
                }

                var url = await _storageService.UploadFileAsync(file, folder);
                return Ok(new { url });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
