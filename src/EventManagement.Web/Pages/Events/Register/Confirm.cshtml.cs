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

namespace losol.EventManagement.Pages.Events.Register
{
    public class ConfirmModel : PageModel
    {
        private readonly ApplicationDbContext _context;
		private readonly IEmailSender _emailSender;
		private readonly UserManager<ApplicationUser> _userManager;
		private readonly IRegistrationService _registrationService;

		private IRenderService _renderService;

        public string Message { get; set; }

		public ConfirmModel(
			ApplicationDbContext context,
			IEmailSender emailSender,
			UserManager<ApplicationUser> userManager,
			IRenderService renderService,
			IRegistrationService registrationService
			)
		{
			_context = context;
			_emailSender = emailSender;
			_userManager = userManager;
            _renderService = renderService;
			_registrationService = registrationService;
		}

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

			var registration = await _registrationService.GetWithEventInfoAsync(id.Value);

            if (registration == null)
            {
                return NotFound();
            }

			if (HttpContext.Request.Query["auth"] == registration.VerificationCode)
			{
				// Set and save verified registration.
				await _registrationService.SetRegistrationAsVerified(id.Value);

				// Get the user which has registered for the event.
				var participant = await _userManager.FindByIdAsync(registration.UserId);

				// Get the event which the user has registered for.
				var eventinfo = registration.EventInfo;


				// Send notification to admin
				var adminEmail = new EmailMessage()
				{
					Name = registration.ParticipantName,
					Email = "losvik@gmail.com",  // TODO: Get admin email from app settings.
					Subject = $@"Kurspåmelding {eventinfo.Title}!",
					Message = $@"{participant.Name} ({participant.Email}) har meldt seg på kurset {eventinfo.Title} (id {registration.EventInfoId}). 
                    Bare så du vet det"
				};
				var adminEmailString = await _renderService.RenderViewToStringAsync("Templates/Email/StandardEmail", adminEmail);
				await _emailSender.SendEmailAsync(adminEmail.Email, adminEmail.Subject, adminEmailString);

				// Send welcome letter to participant
				var participantEmail = new EmailMessage()
				{
					Name = registration.ParticipantName,
					Email = participant.Email,
					Subject = $@"Velkommen til {eventinfo.Title}!",
					Message = eventinfo.WelcomeLetter
				};

				var participantEmailString = await _renderService.RenderViewToStringAsync("Templates/Email/StandardEmail", participantEmail);
				await _emailSender.SendEmailAsync(participantEmail.Email, participantEmail.Subject, participantEmailString);
				return RedirectToPage("/Register/Confirmed");
			}

			// If we came here, something has went wrong.
			return RedirectToPage("/Register/Failed");
        }
    }
}
