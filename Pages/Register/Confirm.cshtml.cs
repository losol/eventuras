using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Data;
using losol.EventManagement.Models;
using losol.EventManagement.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace losol.EventManagement.Pages.Register
{
    public class ConfirmModel : PageModel
    {
        private readonly ApplicationDbContext _context;
		private readonly IEmailSender _emailSender;
		private readonly UserManager<ApplicationUser> _userManager;

        public string Message { get; set; }

        public ConfirmModel(
			ApplicationDbContext context,
			IEmailSender emailSender,
			UserManager<ApplicationUser> userManager
			)
		{
			_context = context;
			_emailSender = emailSender;
			_userManager = userManager;
		}

        public Registration Registration {get;set;}

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            Registration = await _context.Registrations.SingleOrDefaultAsync(m => m.RegistrationId == id);

            if (Registration == null)
            {
                return NotFound();
            }

            if (HttpContext.Request.Query["auth"] == Registration.VerificationCode) 
            {
                Message += " success";
                Registration.Verified = true;
                await  _context.SaveChangesAsync();

                var user = await _userManager.FindByIdAsync(Registration.UserId);


                await _emailSender.SendEmailAsync("losvik@gmail.com",
                "Påmelding kurs",
                $@"{Registration.UserId}, {user.Email}  har meldt seg på kurset {Registration.EventInfoId}
                Bare så du vet det");
                return RedirectToPage("/Register/Confirmed");
            }

            // If we came here, something has went wrong.
            return RedirectToPage("/Register/Failed");
        }
    }
}
