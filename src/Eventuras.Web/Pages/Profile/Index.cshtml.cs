using Eventuras.Domain;
using Eventuras.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using static Eventuras.Domain.Registration;

namespace Eventuras.Pages.Profile
{
    [Authorize]
    public partial class IndexModel : PageModel
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IRegistrationService _registrationsService;

        public IndexModel(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IRegistrationService registrationService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _registrationsService = registrationService;
        }

        public ApplicationUser CurrentUser { get; set; }
        public List<Registration> Registrations { get; set; }
        public List<(string Id, string Title)> OnlineCourses =>
            Registrations.Where(r => r.EventInfo.OnDemand && !string.IsNullOrWhiteSpace(r.EventInfo.ExternalRegistrationsUrl))
                    .Where(r => r.Status != RegistrationStatus.Draft)
                    .Select(r => (
                        Regex.Match(r.EventInfo.ExternalRegistrationsUrl, @"id:(\d*)").Groups[1].Value,
                        r.EventInfo.Title))
                    .ToList();

        public async Task<IActionResult> OnGetAsync()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                await _signInManager.SignOutAsync();
                return RedirectToPage("./Index");
            }

            CurrentUser = user;
            Registrations = await _registrationsService.GetRegistrationsWithOrders(CurrentUser);

            return Page();
        }
    }
}