using Eventuras.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;
using Eventuras.Services;
using Eventuras.Services.Auth;

namespace Eventuras.Controllers
{
    [Route("[controller]/[action]")]
    public class AccountController : Controller
    {
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IEventurasAuthenticationService _authenticationService;
        private readonly ILogger _logger;

        public AccountController(
            SignInManager<ApplicationUser> signInManager,
            IEventurasAuthenticationService authenticationService,
            ILogger<AccountController> logger)
        {
            _signInManager = signInManager;
            _authenticationService = authenticationService ?? throw new ArgumentNullException(nameof(authenticationService));
            _logger = logger;
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task Logout()
        {
            await _authenticationService.HandleLogOutAsync(HttpContext, Url.Page("/Index"));
            _logger.LogInformation("User logged out.");
        }


        [HttpGet("/magic", Name = "MagicLinkRoute")]
        public async Task<IActionResult> MagicLogin([FromQuery] string userid, [FromQuery] string token)
        {
            // Sign the user out if they're signed in
            if (User.Identity.IsAuthenticated)
            {
                await _signInManager.SignOutAsync();
            }

            var user = await _signInManager.UserManager.FindByIdAsync(userid);
            if (user != null)
            {
                token = token.Replace("%2F", "/");
                var isValid = await _signInManager.UserManager.VerifyUserTokenAsync(
                    user: user,
                    tokenProvider: "MagicLinkTokenProvider",
                    purpose: "magic-link",
                    token: token
                );
                if (isValid)
                {
                    await _signInManager.UserManager.UpdateSecurityStampAsync(user);
                    await _signInManager.SignInAsync(user, isPersistent: true);
                }
            }

            return RedirectToPage("/Profile/Index");
        }
    }
}
