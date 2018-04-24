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
            var eventInfo = await eventInfoService.GetAsync(id);
            if(eventInfo == null)
            {
                return NotFound();
            }
            var vm = CertificateVM.Mock;
            
            vm.Title = eventInfo.Title;
            vm.Description = eventInfo.CertificateDescription;
            // vm.EventDateStart = eventInfo.DateStart;
            //vm.EventDateEnd = eventInfo.DateEnd;
            vm.IssuedInCity = eventInfo.City;
            vm.Description = eventInfo.CertificateDescription;
            // TODO: Add organizer details
            
            return View("Templates/Certificates/CourseCertificate", vm);
        }

        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadCertificate(
            [FromServices] CertificatePdfRenderer writer, 
            [FromServices] ICertificatesService certificatesService,
            [FromRoute] int id)
        {
            var certificate = await certificatesService.GetAsync(id);
            if(certificate == null)
            {
                return NotFound();
            }
            
            var stream = await writer.RenderAsync(CertificateVM.From(certificate));
            return File(stream, "application/pdf");
        }
    }
}
