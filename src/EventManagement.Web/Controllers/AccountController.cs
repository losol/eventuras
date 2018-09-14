using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using losol.EventManagement.Domain;
using losol.EventManagement.Services;

namespace losol.EventManagement.Controllers
{
    [Route("[controller]/[action]")]
    public class AccountController : Controller
    {
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IRegistrationService _registrationService;
        private readonly ILogger _logger;

        public AccountController(SignInManager<ApplicationUser> signInManager, UserManager<ApplicationUser> userManager, IRegistrationService registrationService, ILogger<AccountController> logger)
        {
            _signInManager = signInManager;
            _logger = logger;
            _userManager = userManager;
            _registrationService = registrationService;
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            _logger.LogInformation("User logged out.");
            return RedirectToPage("/Index");
        }


        [HttpGet("/magic", Name = "MagicLinkRoute")]
        public async Task<IActionResult> MagicLogin([FromQuery]string userid, [FromQuery]string token )
        {
            // Sign the user out if they're signed in
            if(_signInManager.IsSignedIn(User))
            {
                await _signInManager.SignOutAsync();
            }
            
            var user = await _signInManager.UserManager.FindByIdAsync(userid);
            if(user != null)
            {
                token = token.Replace("%2F", "/");
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


        public async Task<IActionResult> UpdateStaffClaim(int registrationId) {
            await _registrationService.GetAsync(registrationId);
            _logger.LogInformation($"* Want to Updated claims for registrationId {registrationId}");
            return Ok();
        }
    }
}
