using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace Eventuras.Services.Auth
{
    public interface IEventurasAuthenticationService
    {
        Task HandleLogInAsync(HttpContext context, string redirectUrl = null);

        Task HandleLogOutAsync(HttpContext context, string redirectUrl = null);
    }
}
