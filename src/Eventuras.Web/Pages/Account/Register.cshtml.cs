using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Email;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace Eventuras.Pages.Account;

public class RegisterModel : PageModel
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<LoginModel> _logger;
    private readonly IApplicationEmailSender _emailSender;

    public RegisterModel(UserManager<ApplicationUser> userManager, ILogger<LoginModel> logger, IApplicationEmailSender emailSender)
    {
        _userManager = userManager;
        _logger = logger;
        _emailSender = emailSender;
    }

    [BindProperty]
    public InputModel Input { get; set; }

    public string ReturnUrl { get; set; }

    public class InputModel
    {
        [Required]
        [Display(Name = "Navn")]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        [Display(Name = "E-post")]
        public string Email { get; set; }

        [Required]
        [Display(Name = "Mobiltelefon")]
        public string Phone { get; set; }

        [Required]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "Passord")]
        public string Password { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "Gjenta passord")]
        [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
        public string ConfirmPassword { get; set; }
    }

    public void OnGet(string returnUrl = null)
    {
        ReturnUrl = returnUrl;
    }

    public async Task<IActionResult> OnPostAsync(string returnUrl = null)
    {
        ReturnUrl = returnUrl;
        if (ModelState.IsValid)
        {
            var user = new ApplicationUser { Name = Input.Name, UserName = Input.Email, Email = Input.Email, PhoneNumber = Input.Phone };
            var result = await _userManager.CreateAsync(user, Input.Password);
            if (result.Succeeded)
            {
                _logger.LogInformation("User created a new account with password.");

                var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                var callbackUrl = Url.EmailConfirmationLink(user.Id, code, Request.Scheme);

                var subject = "En liten bekreftelse bare...";
                var message = $@"<p>Vi har snart laget en ny bruker til deg, men vil bare at du bekrefter med å trykke på lenken!</p>
								<p><a href='{callbackUrl}'>Bekreft her</a></p>
								<p></p>
								<p>Hvis lenken ikke virker, så kan du kopiere inn teksten under i nettleseren:
								{callbackUrl} </p>";

                await _emailSender.SendStandardEmailAsync($"{Input.Name} <{Input.Email}>", subject, message);
                return RedirectToPage("/Info/EmailSent");
            }

            foreach (var error in result.Errors) ModelState.AddModelError(string.Empty, error.Description);
        }

        // If we got this far, something failed, redisplay form
        return Page();
    }
}