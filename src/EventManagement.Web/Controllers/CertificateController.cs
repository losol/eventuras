using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using losol.EventManagement.Domain;
using losol.EventManagement.Web.Services;
using Microsoft.AspNetCore.Authorization;
using losol.EventManagement.Services.Messaging;
using losol.EventManagement.ViewModels;
using losol.EventManagement.Web.ViewModels;
using losol.EventManagement.Services;
using System.IO;

namespace EventManagement.Web.Controllers
{
    [Authorize (Policy = "AdministratorRole")]
    [Route("certificate")]
    public class CertificateController : Controller
    {
        [HttpGet("{id}")]
        public async Task<IActionResult> ViewCertificate(
            [FromRoute]int id,
            [FromServices] ICertificatesService certificatesService)

        {
            var certificate = await certificatesService.GetAsync(id);
            if(certificate == null)
            {
                return NotFound();
            }
            return View("Templates/Certificates/CourseCertificate", certificate);
        }

        [HttpGet("preview/event/{id}")]
        public async Task<IActionResult> ViewCertificateForEvent([FromRoute]int id,
            [FromServices]IEventInfoService eventInfoService)
        {
            var eventInfo = await eventInfoService.GetWithOrganizerAsync(id);
            if(eventInfo == null)
            {
                return NotFound();
            }
            var vm = CertificateVM.Mock;
            
            vm.Title = eventInfo.Title;
            vm.Description = eventInfo.CertificateDescription;

            vm.EvidenceDescription = $"{eventInfo.Title} {eventInfo.City}";
            if (eventInfo.DateStart.HasValue) 
                { vm.EvidenceDescription += " - " + eventInfo.DateStart.Value.ToString("d");};
            if (eventInfo.DateEnd.HasValue) 
                { vm.EvidenceDescription += " - " + eventInfo.DateEnd.Value.ToString("d");};

            vm.IssuedInCity = eventInfo.City;

            if (eventInfo.OrganizerUser != null && !string.IsNullOrWhiteSpace(eventInfo.OrganizerUser.SignatureImageBase64)) {
                vm.SignatureImageBase64 = "data:image/png;base64,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";
            }

            if (eventInfo.Organization != null && !string.IsNullOrWhiteSpace(eventInfo.Organization.LogoBase64)) {
                vm.OrganizerLogoBase64 = "data:image/png;base64,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";
            }
            
            return View("Templates/Certificates/CourseCertificate", vm);
        }

        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadCertificate(
            [FromServices] CertificatePdfRenderer writer, 
            [FromServices] ICertificatesService certificatesService,
            [FromServices] IEventInfoService eventinfoService,
            [FromRoute] int id)
        {
            var certificate = await certificatesService.GetAsync(id);
            if(certificate == null)
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
