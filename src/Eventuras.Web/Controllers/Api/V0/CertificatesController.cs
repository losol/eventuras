using Eventuras.Services;
using Eventuras.ViewModels;
using Eventuras.Web.Services;
using Eventuras.Web.ViewModels;
using Losol.Communication.Email;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Eventuras.Web.Controllers.Api.V0
{
    [ApiVersion("0")]
    [Authorize(Policy = AuthPolicies.AdministratorRole)]
    [Route("api/certificates")]
    public class CertificatesController : Controller
    {
        private readonly ICertificatesService _certificatesService;

        public CertificatesController(ICertificatesService certificatesService)
        {
            _certificatesService = certificatesService;
        }

        [HttpPost("event/{eventId}/email")]
        public async Task<IActionResult> GenerateCertificatesAndSendEmails([FromRoute] int eventId, [FromServices] CertificatePdfRenderer writer, [FromServices] StandardEmailSender emailSender)
        {
            CultureInfo norwegianCulture = new CultureInfo("nb-NO");
            var certificates = await _certificatesService.CreateCertificatesForEvent(eventId, norwegianCulture);

            foreach (var certificate in certificates)
            {
                var result = await writer.RenderAsync(CertificateVM.From(certificate));
                var memoryStream = new MemoryStream();
                await result.CopyToAsync(memoryStream);
                await emailSender.SendStandardEmailAsync(new EmailMessage
                {
                    Email = certificate.RecipientEmail,
                    Subject = $"Kursbevis for {certificate.Title}",
                    Message = "Her er kursbeviset! Gratulere!",
                    Attachment = new Attachment { Filename = "kursbevis.pdf", Bytes = memoryStream.ToArray(), ContentType = "application/pdf" }
                });
            }
            return Ok();
        }


        [HttpPost("event/{eventId}/update")]
        public async Task<IActionResult> UpdateCertificatesForEvent([FromRoute] int eventId)
        {
            CultureInfo norwegianCulture = new CultureInfo("nb-NO");
            var result = await _certificatesService.UpdateCertificatesForEvent(eventId, norwegianCulture);
            return Ok($"Oppdaterte {result.Count()}");
        }

        [HttpPost("registration/{regId}/email")]
        public async Task<IActionResult> EmailCertificate([FromRoute] int regId, [FromServices] CertificatePdfRenderer writer, [FromServices] StandardEmailSender emailSender)
        {
            var c = await _certificatesService.GetForRegistrationAsync(regId);
            var result = await writer.RenderAsync(CertificateVM.From(c));
            var memoryStream = new MemoryStream();
            await result.CopyToAsync(memoryStream);
            var emailMessage = new EmailMessage
            {
                Email = c.RecipientEmail,
                Subject = $"Kursbevis for {c.Title}",
                Message = "Her er kursbeviset! Gratulere!",
                Attachment = new Attachment
                {
                    Filename = "kursbevis.pdf",
                    Bytes = memoryStream.ToArray(),
                    ContentType = "application/pdf"
                }
            };
            await emailSender.SendStandardEmailAsync(emailMessage);
            return Ok();
        }
    }
}