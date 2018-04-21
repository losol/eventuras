using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using losol.EventManagement.Domain;
using losol.EventManagement.Web.ViewModels.Templates;
using losol.EventManagement.Web.Services;
using Microsoft.AspNetCore.Authorization;
using losol.EventManagement.Services.Messaging;
using losol.EventManagement.ViewModels;
using losol.EventManagement.Services;

namespace EventManagement.Web.Controllers
{
    [Authorize (Policy = "AdministratorRole")]
    [Route("certificate")]
    public class CertificateController : Controller
    {
        [HttpGet("{id}")]
        public IActionResult ViewCertificate([FromRoute]int id)
        {
            return View("Templates/Certificates/CourseCertificate", CertificateVM.Mock);
        }

        [HttpGet("for_event/{id}")]
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
            vm.EventDateStart = eventInfo.DateStart;
            vm.EventDateEnd = eventInfo.DateEnd;
            vm.City = eventInfo.City;
            vm.Accreditation = eventInfo.CertificateDescription;
            // TODO: Add organizer details
            
            return View("Templates/Certificates/CourseCertificate", vm);
        }

        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadCertificate(
            [FromServices] CertificatePdfRenderer writer, 
            [FromServices] IRegistrationService registrationService,
            [FromRoute] int id)
        {
            var certificate = await registrationService.GetCertificateAsync(id);
            if(certificate == null)
            {
                return NotFound();
            }
            
            var stream = await writer.RenderAsync(CertificateVM.From(certificate));
            return File(stream, "application/pdf");
        }
    }
}
