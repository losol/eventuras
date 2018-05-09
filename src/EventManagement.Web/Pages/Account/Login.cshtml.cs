using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using losol.EventManagement.Domain;
using losol.EventManagement.Web.Services;

namespace losol.EventManagement.Pages.Account
{
    public class LoginModel : PageModel
    {
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly MagicLinkSender _magicLinkSender;
        private readonly ILogger<LoginModel> _logger;

        public LoginModel(SignInManager<ApplicationUser> signInManager, 
            MagicLinkSender magicLinkSender,
            ILogger<LoginModel> logger)
        {
            _signInManager = signInManager;
            _magicLinkSender = magicLinkSender;
            _logger = logger;
        }

        [BindProperty]
        public InputModel Input { get; set; }

        [BindProperty]
        [EmailAddress]
        [Display(Name = "Epostadresse?")]
        public string Email { get; set; } = string.Empty;

        public IList<AuthenticationScheme> ExternalLogins { get; set; }

        public string ReturnUrl { get; set; }

        [TempData]
        public string ErrorMessage { get; set; }

        [TempData]
        public string SuccessMessage { get; set; }

        public async Task OnGetAsync(string returnUrl = null)
        {
            if (!string.IsNullOrEmpty(ErrorMessage))
            {
                ModelState.AddModelError(string.Empty, ErrorMessage);
            }

            // Clear the existing external cookie to ensure a clean login process
            await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);

            ExternalLogins = (await _signInManager.GetExternalAuthenticationSchemesAsync()).ToList();

            ReturnUrl = returnUrl;
        }

        public async Task<IActionResult> OnPostAsync(string returnUrl = null)
        {
            ReturnUrl = returnUrl;
            ModelState.Clear();
            if (TryValidateModel(Input))
            {
                var result = await _signInManager.PasswordSignInAsync(Input.Email, Input.Password, Input.RememberMe, lockoutOnFailure: true);
                if (result.Succeeded)
                {
                    _logger.LogInformation("User logged in.");
                    return LocalRedirect(Url.GetLocalUrl(returnUrl));
                }
                if (result.RequiresTwoFactor)
                {
                    return RedirectToPage("./LoginWith2fa", new { ReturnUrl = returnUrl, RememberMe = Input.RememberMe });
                }
                if (result.IsLockedOut)
                {
                    _logger.LogWarning("User account locked out.");
                    return RedirectToPage("./Lockout");
                }
                else
                {
                    ModelState.AddModelError(string.Empty, "Invalid login attempt.");
                    return Page();
                }
            }

            // If we got this far, something failed, redisplay form
            return Page();
        }

        public async Task<IActionResult> OnPostSendMagicLinkAsync()
        {
            ModelState.Clear();

            if(TryValidateModel(Email))
            {
                var user = await _signInManager.UserManager.FindByEmailAsync(Email);
                if(user != null)
                {
                    // Send the email only if the email exists
                    await _magicLinkSender.SendMagicLinkAsync(user);
                }
                
                SuccessMessage = "Magic Link sent to your inbox!";
                Email = string.Empty;
            }
            return RedirectToPage("/Account/MagicLinkSent");
        }

        public class InputModel
        {
            [Required]
            [Display(Name = "Epostadresse?")]
            [EmailAddress]
            public string Email { get; set; }

            [Required]
            [Display(Name = "Passord?")]
            [DataType(DataType.Password)]
            public string Password { get; set; }

            [Display(Name = "Husk meg?")]
            public bool RememberMe { get; set; }
        }
    }
}
