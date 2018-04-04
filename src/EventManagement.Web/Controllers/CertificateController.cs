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
    [Authorize] // TODO: ensure that only the relevant user / course admin can access these routes
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
            vm.Date = eventInfo.DateEnd?.ToString("dd.MM.yyyy");
            vm.City = eventInfo.City;
            return View("Templates/Certificates/CourseCertificate", vm);
        }

        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadCertificate(
            [FromServices]CertificateWriter writer, 
            [FromRoute]int id)
        {
            string filename = $"{DateTime.Now.ToString("u")}.pdf";
            var result = await writer.Write(filename, CertificateVM.Mock);
            var bytes = await System.IO.File.ReadAllBytesAsync(writer.GetPathForFile(filename));
            return File(bytes, "application/pdf");
        }
    }
}
