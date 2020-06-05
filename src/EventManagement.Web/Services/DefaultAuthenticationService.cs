using System;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using losol.EventManagement.Services;
using losol.EventManagement.Services.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;

namespace losol.EventManagement.Web.Services
{
    public class DefaultAuthenticationService : IEventManagementAuthenticationService
    {
        private readonly SignInManager<ApplicationUser> _signInManager;

        public DefaultAuthenticationService(SignInManager<ApplicationUser> signInManager)
        {
            _signInManager = signInManager ?? throw new ArgumentNullException(nameof(signInManager));
        }

        public async Task HandleLogInAsync(HttpContext context, string redirectUrl)
        {
            // Clear the existing external cookie to ensure a clean login process
            await context.SignOutAsync();
        }

        public async Task HandleLogOutAsync(HttpContext context, string redirectUrl)
        {
            await _signInManager.SignOutAsync();

            if (!string.IsNullOrEmpty(redirectUrl))
            {
                context.Response.Redirect(redirectUrl);
            }
        }
    }
}
