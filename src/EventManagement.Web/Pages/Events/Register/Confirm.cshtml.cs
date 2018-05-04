using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using losol.EventManagement.Services;
using losol.EventManagement.Services.Messaging;
using losol.EventManagement.ViewModels;
using losol.EventManagement.Web.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using static losol.EventManagement.Domain.Registration;

namespace losol.EventManagement.Pages.Events.Register
{
    public class ConfirmModel : PageModel
    {
        private readonly ApplicationDbContext _context;
		private readonly UserManager<ApplicationUser> _userManager;
		private readonly IRegistrationService _registrationService;
		private readonly RegistrationEmailSender _registrationEmailSender;
		private readonly StandardEmailSender _standardEmailSender;

        public string Message { get; set; }

		public ConfirmModel(
			ApplicationDbContext context,
			UserManager<ApplicationUser> userManager,
			RegistrationEmailSender registrationEmailSender,
			IRegistrationService registrationService,
			StandardEmailSender standardEmailSender
			)
		{
			_context = context;
			_registrationEmailSender = registrationEmailSender;
			_userManager = userManager;
			_registrationService = registrationService;
			_standardEmailSender = standardEmailSender;
		}

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

			var registration = await _registrationService.GetWithUserAndEventInfoAsync(id.Value);

            if (registration == null)
            {
                return NotFound();
            }

			if (HttpContext.Request.Query["auth"] == registration.VerificationCode)
			{
				if (registration.Status == RegistrationStatus.Draft || registration.Status == RegistrationStatus.Cancelled)
				await _registrationService.SetRegistrationAsVerified(id.Value);

				// Send a copy to admin TODO: Read from appsettings
				var adminmessage = "Hurra! Enda en påmelding!";
				await _registrationEmailSender.SendRegistrationAsync("kurs@nordland-legeforening.no", $"KOPI: Påmelding {registration.EventInfo.Title}", adminmessage,registration.RegistrationId);
				
				// Send welcome letter to participant
				var participantEmail = new EmailMessage()
				{
					Name = registration.ParticipantName,
					Email = registration.User.Email,
					Subject = $@"Velkommen til {registration.EventInfo.Title}!",
					Message = registration.EventInfo.WelcomeLetter
				};

				await _standardEmailSender.SendStandardEmailAsync(participantEmail);
				return RedirectToPage("./Confirmed");
			}

			// If we came here, something has went wrong.
			return RedirectToPage("./Failed");
        }
    }
}
