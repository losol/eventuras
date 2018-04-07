using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using losol.EventManagement.Services;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace losol.EventManagement.Pages.Admin.Users
{
    public class CreateModel : PageModel
    {
         private readonly UserManager<ApplicationUser> _userManager;

		public CreateModel(UserManager<ApplicationUser> userManager)
        {
			_userManager = userManager;
        }

        public string StatusMessage {get;set;}

        [BindProperty]
        public InputModel Input { get; set; }

        public class InputModel {

            [Display(Name = "Navn", Description = "Hele navnet til brukeren")]
            [Required]
            [StringLength(100, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
            public string Name { get; set; }

            [Display(Name = "Epost", Description = "Epost til bruker")]
            [Required]
            [EmailAddress]
            public string Email { get; set; }

            [Display(Name = "Landkode", Description = "Landkode")]
            [StringLength(10, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 2)]
            public string PhoneCountryCode { get; set; } = "+47";

            [Display(Name = "Mobiltelefon", Description = "Epost til bruker")]
            [StringLength(100, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 5)]
            public string PhoneNumber { get; set; }

        }

        public IActionResult OnGet()
        {
            Input = new InputModel();
            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }
            
            var user = new ApplicationUser { Name = Input.Name, UserName = Input.Email, Email = Input.Email, PhoneNumber = (Input.PhoneCountryCode + Input.PhoneNumber)};
            var result = await _userManager.CreateAsync(user);
            return RedirectToPage("./Index");
        }
    }
}