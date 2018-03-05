using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using losol.EventManagement.Services;
using losol.EventManagement.ViewModels;
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

		private IRenderService _renderService;

        public string Message { get; set; }

        public ConfirmModel(
			ApplicationDbContext context,
			IEmailSender emailSender,
			UserManager<ApplicationUser> userManager,
			IRenderService renderService
			)
		{
			_context = context;
			_emailSender = emailSender;
			_userManager = userManager;
            _renderService = renderService;
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
                // Set and save verified registration.
                Registration.Verified = true;
                await  _context.SaveChangesAsync();

                // Get the user which has registered for the event.
                var participant = await _userManager.FindByIdAsync(Registration.UserId);

                // Get the event which the user has registered for.
                var eventinfo = await _context.EventInfos.SingleOrDefaultAsync(n => n.EventInfoId == Registration.EventInfoId);


                // Send notification to admin
                var adminEmail = new EmailMessage()
				{
					Name = Registration.ParticipantName,
					Email = "losvik@gmail.com",  // TODO: Get admin email from app settings.
					Subject = $@"Kurspåmelding {eventinfo.Title}!",
					Message = $@"{participant.Name} ({participant.Email}) har meldt seg på kurset {eventinfo.Title} (id {Registration.EventInfoId}). 
                        Bare så du vet det"
				};
                var adminEmailString = await _renderService.RenderViewToStringAsync("Templates/Email/StandardEmail", adminEmail);
                await _emailSender.SendEmailAsync(adminEmail.Email, adminEmail.Subject, adminEmailString);

                // Send welcome letter to participant
				var participantEmail = new EmailMessage()
				{
					Name = Registration.ParticipantName,
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
