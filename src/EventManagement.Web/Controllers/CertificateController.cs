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
            return View("Templates/Certificates/CourseCertificate", CertificateVM.From(certificate));
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

            if (eventInfo.OrganizerUser != null) {
                vm.IssuerPersonName = eventInfo.OrganizerUser.Name;
            }

            if (eventInfo.OrganizerUser != null && !string.IsNullOrWhiteSpace(eventInfo.OrganizerUser.SignatureImageBase64)) {
                vm.IssuerPersonSignatureImageBase64 = eventInfo.OrganizerUser.SignatureImageBase64;
            }

            if (eventInfo.Organization != null) {
                vm.IssuerOrganizationName = eventInfo.Organization.Name;
             }

            if (eventInfo.Organization != null && !string.IsNullOrWhiteSpace(eventInfo.Organization.LogoBase64)) {
                vm.IssuerOrganizationLogoBase64 = eventInfo.Organization.LogoBase64;   
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
