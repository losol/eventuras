using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using F = System.IO.File;

using System.Text;
using losol.EventManagement.Services;
using losol.EventManagement.Services.Messaging;
using losol.EventManagement.ViewModels;
using losol.EventManagement.Web.Services;
using losol.EventManagement.Web.ViewModels.Templates;
using Microsoft.AspNetCore.Authorization;

namespace losol.EventManagement.Web.Controllers.Api {

    [Authorize (Policy = "AdministratorRole")]
    [Route ("api/participants")]
    public class ParticipantsController : Controller {

        private readonly IRegistrationService _registrationService;

        public ParticipantsController (IRegistrationService registrationService) {
            _registrationService = registrationService;
        }

        [HttpPost ("email_certificates/for_event/{eventId}")]
        public async Task<IActionResult> GenerateCertificatesAndSendEmails ([FromRoute] int eventId, [FromServices] CertificateWriter writer, [FromServices] StandardEmailSender emailSender) {
            var certificates = await _registrationService.CreateNewCertificates (eventId, User.Identity.Name);
            var emailTasks = certificates.Select (async c => {
                string filename = $"{DateTime.Now.ToString("u")}.pdf";
                var result = await writer.Write (filename, CertificateVM.From (c));
                var bytes = await F.ReadAllBytesAsync (writer.GetPathForFile (filename));
                return emailSender.SendAsync (new EmailMessage {
                    Email = c.RecipientUser.Email,
                        Subject = $"Certificate for {c.Title}",
                        Message = "Here's your certificate! Congratulations!", // TODO: Get this right
                        Attachment = new Attachment { Filename = "certificate.pdf", Bytes = bytes }
                });
            });
            await Task.WhenAll (emailTasks);
            return Ok (certificates.Select (c => new { c.CertificateId }));
        }

        [HttpPost ("order_emails/{eventId}")]
        public async Task<IActionResult> OrderEmails ([FromRoute] int eventId, [FromServices] StandardEmailSender emailSender, [FromServices] IRegistrationService registrationService, [FromBody] EmailVm vm) {
            var registrations = await registrationService.GetRegistrationsWithOrders (eventId);
            var emailTasks = registrations.Select (r => {
                var message = new EmailMessage {
                Name = r.ParticipantName,
                Email = r.User.Email,
                Subject = vm.Subject,
                Message = vm.Message
                };
                if (r.HasOrder) {
                    StringBuilder builder = new StringBuilder ();
                    builder.AppendLine ("<br>");
                    builder.AppendLine ("<h4>Your Order</h4>");
                    r.Order.OrderLines?.ForEach ((line) => builder.AppendLine ($"<br>{line.ProductName}"));

                    message.Message += builder.ToString ();
                }
                return emailSender.SendAsync (message);
            });
            await Task.WhenAll (emailTasks);
            return Ok ();
        }

        [HttpPost ("mark_as_attended/{id}")]
        public async Task<IActionResult> MarkAsAttended ([FromRoute] int id) {
            await _registrationService.SetRegistrationAsAttended (id);
            return Ok ();
        }

        [HttpPost ("mark_as_notattended/{id}")]
        public async Task<IActionResult> MarkAsNotAttended ([FromRoute] int id) {
            await _registrationService.SetRegistrationAsNotAttended (id);
            return Ok ();
        }

        public class EmailVm {
            public string Subject { get; set; }
            public string Message { get; set; }

        }
    }
}