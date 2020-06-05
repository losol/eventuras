using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace losol.EventManagement.Services.Auth
{
    public interface IEventManagementAuthenticationService
    {
        Task HandleLogInAsync(HttpContext context, string redirectUrl = null);

        Task HandleLogOutAsync(HttpContext context, string redirectUrl = null);
    }
}
