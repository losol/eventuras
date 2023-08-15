using System.Threading.Tasks;
using Eventuras.Services.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;

namespace Eventuras.Services.Auth0;

internal class Auth0AuthenticationService : IEventurasAuthenticationService
{
    public async Task HandleLogInAsync(HttpContext context, string redirectUrl = null)
    {
        await context.ChallengeAsync(Auth0IntegrationConstants.AuthScheme,
            new AuthenticationProperties
            {
                RedirectUri = redirectUrl,
            });
    }

    public async Task HandleLogOutAsync(HttpContext context, string redirectUrl = null)
    {
        await context.SignOutAsync(Auth0IntegrationConstants.AuthScheme,
            new AuthenticationProperties
            {
                // Indicate here where Auth0 should redirect the user after a logout.
                // Note that the resulting absolute Uri must be whitelisted in the
                // **Allowed Logout URLs** settings for the app.
                RedirectUri = redirectUrl,
            });

        await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
    }
}