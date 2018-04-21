using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using F = System.IO.File;

using System.IO;
using System.Text;
using losol.EventManagement.Domain;
using losol.EventManagement.Services;
using losol.EventManagement.Services.Messaging;
using losol.EventManagement.ViewModels;
using losol.EventManagement.Web.Services;
using losol.EventManagement.Web.ViewModels.Templates;
using Microsoft.AspNetCore.Authorization;

namespace losol.EventManagement.Web.Controllers.Api {

    [Authorize (Policy = "AdministratorRole")]
    [Route ("api/certificates")]
    public class CertificatesController : Controller {

        private readonly IRegistrationService _registrationService;
        private readonly ICertificatesService _certificatesService;

        public CertificatesController (IRegistrationService registrationService, ICertificatesService certificatesService) {
            _registrationService = registrationService;
            _certificatesService = certificatesService;
        }

        [HttpPost ("email_certificates/for_event/{eventId}")]
        public async Task<IActionResult> GenerateCertificatesAndSendEmails ([FromRoute] int eventId, [FromServices] CertificatePdfRenderer writer, [FromServices] StandardEmailSender emailSender) {
            var certificates = await _certificatesService.CreateNewCertificates (eventId, User.Identity.Name);
            var emailTasks = certificates.Select (async c => {
                var result = await writer.RenderAsync (CertificateVM.From (c));
                var memoryStream = new MemoryStream ();
                await result.CopyToAsync (memoryStream);
                return emailSender.SendAsync (new EmailMessage {
                    Email = c.RecipientEmail,
                        Subject = $"Kursbevis for {c.Title}",
                        Message = "Her er kursbeviset! Gratulere!",
                        Attachment = new Attachment { Filename = "kursbevis.pdf", Bytes = memoryStream.ToArray () }
                });
            });
            await Task.WhenAll (emailTasks);
            return Ok (certificates.Select (c => new { c.CertificateId }));
        }

        [HttpPost ("registration/{regId}/email")]
        public async Task<IActionResult> EmailCertificate ([FromRoute] int regId, [FromServices] CertificatePdfRenderer writer, [FromServices] StandardEmailSender emailSender) {
            var c = await _certificatesService.GetAsync (regId);
            var result = await writer.RenderAsync (CertificateVM.From (c));
            var memoryStream = new MemoryStream ();
            await result.CopyToAsync (memoryStream);
            var emailMessage = new EmailMessage {
                Email = c.RecipientEmail,
                Subject = $"Kursbevis for {c.Title}",
                Message = "Her er kursbeviset! Gratulere!",
                Attachment = new Attachment {
                Filename = "kursbevis.pdf",
                Bytes = memoryStream.ToArray ()
                }
            };
            await emailSender.SendAsync (emailMessage);
            return Ok ();
        }
    }
}