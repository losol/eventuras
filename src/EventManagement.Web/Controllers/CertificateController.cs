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

namespace EventManagement.Web.Controllers
{
    [Route("certificate")]
    public class CertificateController : Controller
    {
        [HttpGet("{id}")]
        public IActionResult ViewCertificate([FromRoute]int id)
        {
            return View("Templates/Certificates/CourseCertificate", CertificateVM.Mock);
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
