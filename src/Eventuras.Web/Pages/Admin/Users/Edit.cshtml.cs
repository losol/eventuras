using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Eventuras.Domain;

namespace Eventuras.Pages.Admin.Users
{
    public class EditModel : PageModel
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public EditModel(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        [BindProperty]
        public InputModel Input { get; set; }

        public class InputModel
        {
            [Required]
            [Display(Name = "Fullt navn")]
            public string Name { get; set; }

            [Required]
            [EmailAddress]
            [Display(Name = "Epost")]
            public string Email { get; set; }

            [Display(Name = "Mobilnummer")]
            public string PhoneNumber { get; set; }

            [Display(Name = "Signatur som Base64")]
            public string SignatureImageBase64 { get; set; }

        }



        [TempData]
        public string StatusMessage { get; set; }

        public async Task<IActionResult> OnGetAsync(string id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                throw new ApplicationException($"Unable to load user with ID '{_userManager.GetUserId(User)}'.");
            }

            Input = new InputModel
            {
                Name = user.Name,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                SignatureImageBase64 = user.SignatureImageBase64
            };

            return Page();
        }

        public async Task<IActionResult> OnPostAsync(string id)
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                throw new ApplicationException($"Unable to load user with ID '{_userManager.GetUserId(User)}'.");
            }


            if (Input.Name != user.Name)
            {
                user.Name = Input.Name;
                var setNameResult = await _userManager.UpdateAsync(user);
                if (!setNameResult.Succeeded)
                {
                    throw new ApplicationException($"Unexpected error occurred setting email for user with ID '{user.Id}'.");
                }
            }

            if (Input.Email != user.Email)
            {
                // Set new email address
                var setEmailResult = await _userManager.SetEmailAsync(user, Input.Email);

                // Change username to the new address
                user.UserName = Input.Email;
                var setNameResult = await _userManager.UpdateAsync(user);
                if (!setEmailResult.Succeeded)
                {
                    throw new ApplicationException($"Unexpected error occurred setting email for user with ID '{user.Id}'.");
                }
            }

            if (Input.PhoneNumber != user.PhoneNumber)
            {
                var setPhoneResult = await _userManager.SetPhoneNumberAsync(user, Input.PhoneNumber);
                if (!setPhoneResult.Succeeded)
                {
                    throw new ApplicationException($"Unexpected error occurred setting phone number for user with ID '{user.Id}'.");
                }
            }

            if (Input.SignatureImageBase64 != user.SignatureImageBase64)
            {
                user.SignatureImageBase64 = Input.SignatureImageBase64;
                var setSignatureResult = await _userManager.UpdateAsync(user);
                if (!setSignatureResult.Succeeded)
                {
                    throw new ApplicationException($"Unexpected error occurred setting email for user with ID '{user.Id}'.");
                }
            }

            StatusMessage = "Profilen er oppdatert!";
            return RedirectToPage();
        }
    }
}
