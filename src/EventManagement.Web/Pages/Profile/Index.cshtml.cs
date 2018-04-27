using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using losol.EventManagement.Domain;
using losol.EventManagement.Services;
using losol.EventManagement.Services.Messaging;

namespace losol.EventManagement.Pages.Profile
{
    public partial class IndexModel : PageModel
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IRegistrationService _registrationsService;

        public IndexModel(
            UserManager<ApplicationUser> userManager,
            IRegistrationService registrationService )
        {
            _userManager = userManager;
            _registrationsService = registrationService;
        }

        public ApplicationUser CurrentUser { get; set;}
        public List<Registration> Registrations { get; set; }

        public async Task<IActionResult> OnGetAsync()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                throw new ApplicationException($"Unable to load user with ID '{_userManager.GetUserId(User)}'.");
            }

            CurrentUser = user;
            Registrations = await _registrationsService.GetRegistrationsWithOrders(CurrentUser);

            return Page();
        }
    }
}
