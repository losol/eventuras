using System.Threading.Tasks;
using Eventuras.Services;
using Eventuras.Services.Email;
using Eventuras.Web.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using static Eventuras.Domain.Registration;

namespace Eventuras.Pages.Events.Register
{
    public class ConfirmModel : PageModel
    {
        private readonly IRegistrationService _registrationService;
        private readonly RegistrationEmailSender _registrationEmailSender;
        private readonly IApplicationEmailSender _standardEmailSender;

        public string Message { get; set; }

        public ConfirmModel(
            RegistrationEmailSender registrationEmailSender,
            IRegistrationService registrationService,
            IApplicationEmailSender standardEmailSender)
        {
            _registrationEmailSender = registrationEmailSender;
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
                var adminmessage = "<p>Hurra! Enda en påmelding!</p>";
                await _registrationEmailSender.SendRegistrationAsync("kurs@nordland-legeforening.no", $"KOPI: Påmelding {registration.EventInfo.Title}", adminmessage, registration.RegistrationId);

                // Send welcome letter to participant
                await _standardEmailSender.SendStandardEmailAsync(
                    $@"{registration.ParticipantName} <{registration.User.Email}>",
                    $@"Velkommen til {registration.EventInfo.Title}!",
                    registration.EventInfo.WelcomeLetter);
                
                return RedirectToPage("./Confirmed");
            }

            // If we came here, something has went wrong.
            return RedirectToPage("./Failed");
        }
    }
}
