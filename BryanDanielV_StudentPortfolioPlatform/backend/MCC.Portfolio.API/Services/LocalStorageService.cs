using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace MCC.Portfolio.API.Services
{
    public class LocalStorageService : IStorageService
    {
        private readonly IWebHostEnvironment _env;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public LocalStorageService(IWebHostEnvironment env, IHttpContextAccessor httpContextAccessor)
        {
            _env = env;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<string> UploadFileAsync(IFormFile file, string folder)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File is empty.");
            }

            // Resolve wwwroot path the same way Program.cs does:
            // 1. Try AppContext.BaseDirectory/wwwroot (when published / bin output)
            // 2. Fallback to cwd/wwwroot (when running via `dotnet run`)
            var webRootPath = _env.WebRootPath;
            if (string.IsNullOrEmpty(webRootPath) || !Directory.Exists(webRootPath))
            {
                webRootPath = Path.Combine(AppContext.BaseDirectory, "wwwroot");
            }
            if (!Directory.Exists(webRootPath))
            {
                webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            }
            if (!Directory.Exists(webRootPath))
            {
                Directory.CreateDirectory(webRootPath);
            }

            // Create target folder path
            var uploadDir = Path.Combine(webRootPath, "uploads", folder);
            if (!Directory.Exists(uploadDir))
            {
                Directory.CreateDirectory(uploadDir);
            }

            // Secure file name (remove spaces to avoid URL encoding issues)
            var cleanFileName = Path.GetFileNameWithoutExtension(file.FileName)
                .Replace(" ", "_")
                .Replace("(", "")
                .Replace(")", "");
            var extension = Path.GetExtension(file.FileName).ToLower();
            var uniqueFileName = $"{Guid.NewGuid()}_{cleanFileName}{extension}";
            var filePath = Path.Combine(uploadDir, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Retrieve request protocol/host to return absolute URL
            var request = _httpContextAccessor.HttpContext?.Request;
            var baseUrl = request != null ? $"{request.Scheme}://{request.Host}" : "http://localhost:5019";

            return $"{baseUrl}/uploads/{folder}/{uniqueFileName}";
        }
    }
}
