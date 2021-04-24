using Eventuras.Services;
using Eventuras.Web.Services;
using Eventuras.Web.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;
using Eventuras.Services.Events;
using Eventuras.Web;
using System.Globalization;

namespace Eventuras.Web.Controllers
{
    [Authorize(Policy = AuthPolicies.AdministratorRole)]
    [Route("certificate")]
    public class CertificateController : Controller
    {
        [HttpGet("{id}")]
        public async Task<IActionResult> ViewCertificate(
            [FromRoute] int id,
            [FromServices] ICertificatesService certificatesService)

        {
            var certificate = await certificatesService.GetAsync(id);
            if (certificate == null)
            {
                return NotFound();
            }
            return View("Templates/Certificates/CourseCertificate", CertificateVM.From(certificate));
        }

        [HttpGet("preview/event/{id}")]
        public async Task<IActionResult> ViewCertificateForEvent([FromRoute] int id,
            [FromServices] IEventInfoRetrievalService eventInfoService)
        {
            var eventInfo = await eventInfoService.GetEventInfoByIdAsync(id, new EventInfoRetrievalOptions
            {
                LoadOrganizerUser = true,
                LoadOrganization = true
            });

            if (eventInfo == null)
            {
                return NotFound();
            }
            var vm = CertificateVM.Mock;

            vm.Title = eventInfo.Title;
            vm.Description = eventInfo.CertificateDescription;

            CultureInfo norwegianCulture = new CultureInfo("nb-NO");
            vm.EvidenceDescription = $"{eventInfo.Title} {eventInfo.City}";
            if (eventInfo.DateStart.HasValue)
            { vm.EvidenceDescription += " - " + eventInfo.DateStart.Value.ToString("dd.MM.yyyy"); };
            if (eventInfo.DateEnd.HasValue)
            { vm.EvidenceDescription += " - " + eventInfo.DateEnd.Value.ToString("dd.MM.yyyy"); };

            vm.IssuedInCity = eventInfo.City;

            if (eventInfo.OrganizerUser != null)
            {
                vm.IssuerPersonName = eventInfo.OrganizerUser.Name;
            }

            if (eventInfo.OrganizerUser != null && !string.IsNullOrWhiteSpace(eventInfo.OrganizerUser.SignatureImageBase64))
            {
                vm.IssuerPersonSignatureImageBase64 = eventInfo.OrganizerUser.SignatureImageBase64;
            }

            if (eventInfo.Organization != null)
            {
                vm.IssuerOrganizationName = eventInfo.Organization.Name;
            }

            if (eventInfo.Organization != null && !string.IsNullOrWhiteSpace(eventInfo.Organization.LogoBase64))
            {
                vm.IssuerOrganizationLogoBase64 = eventInfo.Organization.LogoBase64;
            }

            return View("Templates/Certificates/CourseCertificate", vm);
        }

        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadCertificate(
            [FromServices] CertificatePdfRenderer writer,
            [FromServices] ICertificatesService certificatesService,
            [FromRoute] int id)
        {
            var certificate = await certificatesService.GetAsync(id);
            if (certificate == null)
            {
                return NotFound();
            }

            var stream = await writer.RenderAsync(CertificateVM.From(certificate));
            MemoryStream memoryStream = new MemoryStream();
            await stream.CopyToAsync(memoryStream);
            return File(memoryStream.ToArray(), "application/pdf");
        }
    }
}
