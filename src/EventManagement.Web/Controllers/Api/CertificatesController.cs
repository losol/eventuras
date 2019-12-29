using losol.EventManagement.Services;
using losol.EventManagement.ViewModels;
using losol.EventManagement.Web.Services;
using losol.EventManagement.Web.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Losol.Communication.Email;

namespace losol.EventManagement.Web.Controllers.Api
{

    [Authorize (Policy = "AdministratorRole")]
    [Route ("api/certificates")]
    public class CertificatesController : Controller {
        private readonly ICertificatesService _certificatesService;

        public CertificatesController (ICertificatesService certificatesService) {
            _certificatesService = certificatesService;
        }

        [HttpPost ("event/{eventId}/email")]
        public async Task<IActionResult> GenerateCertificatesAndSendEmails ([FromRoute] int eventId, [FromServices] CertificatePdfRenderer writer, [FromServices] StandardEmailSender emailSender) {
            var certificates = await _certificatesService.CreateCertificatesForEvent(eventId);

            foreach( var certificate in certificates ) {
                var result = await writer.RenderAsync( CertificateVM.From ( certificate ) );
                var memoryStream = new MemoryStream ();
                await result.CopyToAsync (memoryStream);
                await emailSender.SendStandardEmailAsync (new EmailMessage {
                    Email = certificate.RecipientEmail,
                        Subject = $"Kursbevis for {certificate.Title}",
                        Message = "Her er kursbeviset! Gratulere!",
                        Attachment = new Attachment { Filename = "kursbevis.pdf", Bytes = memoryStream.ToArray () }
                });
            }
            return Ok ();
        }


        [HttpPost ("event/{eventId}/update")]
        public async Task<IActionResult> UpdateCertificatesForEvent ( [FromRoute] int eventId ) {
            var result = await _certificatesService.UpdateCertificatesForEvent(eventId);
            return Ok ( $"Oppdaterte {result.Count()}");
        }

        [HttpPost ("registration/{regId}/email")]
        public async Task<IActionResult> EmailCertificate ([FromRoute] int regId, [FromServices] CertificatePdfRenderer writer, [FromServices] StandardEmailSender emailSender) {
            var c = await _certificatesService.GetForRegistrationAsync (regId);
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
            await emailSender.SendStandardEmailAsync (emailMessage);
            return Ok ();
        }
    }
}