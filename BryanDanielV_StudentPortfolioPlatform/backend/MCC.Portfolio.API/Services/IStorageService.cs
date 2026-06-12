using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace MCC.Portfolio.API.Services
{
    public interface IStorageService
    {
        Task<string> UploadFileAsync(IFormFile file, string folder);
    }
}
