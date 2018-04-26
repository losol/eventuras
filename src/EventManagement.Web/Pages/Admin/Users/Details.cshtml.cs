using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using losol.EventManagement.Domain;
using losol.EventManagement.Services;

namespace losol.EventManagement.Pages.Admin.Users
{
    public class DetailsModel : PageModel
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IRegistrationService _registrationService;


        public DetailsModel(UserManager<ApplicationUser> userManager, IRegistrationService registrationService)
        {
            _userManager = userManager;
            _registrationService = registrationService;
        }

        [BindProperty]
        public DetailsVM UserProfile { get; set; }

        public class DetailsVM
        {
            public string UserId { get; set; }
            public string Name { get; set; }
            public string Email { get; set; }
            public string Phone { get; set; }

            public List<Registration> Registrations { get; set; }

        }

        public async Task<IActionResult> OnGetAsync(string id)
        {

            if (id == null)
            {
                return NotFound();
            }

            var user = await _userManager.FindByIdAsync(id);
            // var userRegistrations = await _db.Registrations.

            UserProfile = new DetailsVM();

            UserProfile.UserId = user.Id;
            UserProfile.Name = user.Name;
            UserProfile.Email = user.Email;
            UserProfile.Phone = user.PhoneNumber;
            // UserProfile.Registrations = _registrationService.GetRegistrations()

			return Page();
        }

    }
}
