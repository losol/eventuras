using System;
using System.Net;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Controllers
{
    [Route("[controller]/[action]")]
    public class AccountController : Controller
    {
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly ILogger _logger;

        public AccountController(SignInManager<ApplicationUser> signInManager, ILogger<AccountController> logger)
        {
            _signInManager = signInManager;
            _logger = logger;
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            _logger.LogInformation("User logged out.");
            return RedirectToPage("/Index");
        }

        [HttpGet("magic", Name = "MagicLinkRoute")]
            public async Task<IActionResult> MagicLogin([FromQuery]string userid, [FromQuery]string token)
            {
            // Sign the user out if they're signed in
            if(_signInManager.IsSignedIn(User))
            {
                await _signInManager.SignOutAsync();
            }
            
            var user = await _signInManager.UserManager.FindByIdAsync(userid);
            if(user != null)
            {
                // token = token.Replace("%2F", "/");
                var isValid = await _signInManager.UserManager.VerifyUserTokenAsync(
                    user: user,
                    tokenProvider: "MagicLinkTokenProvider",
                    purpose: "magic-link",
                    token: token
                );
                if(isValid)
                {
                    await _signInManager.UserManager.UpdateSecurityStampAsync(user);
                    await _signInManager.SignInAsync(user, isPersistent: true);
                }
            }
            
            return RedirectToPage("/Profile/Index");
        }
    }
}
