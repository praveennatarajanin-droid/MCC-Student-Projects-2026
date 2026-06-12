using MCC.Portfolio.API.Models;

namespace MCC.Portfolio.API.Services
{
    public interface ITokenService
    {
        string CreateToken(User user);
    }
}
