using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Eventuras.Services.Auth;

public interface IEventurasAuthenticationService
{
    Task HandleLogInAsync(HttpContext context, string redirectUrl = null);

    Task HandleLogOutAsync(HttpContext context, string redirectUrl = null);
}