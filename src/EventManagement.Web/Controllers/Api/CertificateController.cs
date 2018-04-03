using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Web.Services;
using losol.EventManagement.Web.ViewModels.Templates.Certificates;
using Microsoft.AspNetCore.Mvc;

namespace losol.EventManagement.Web.Controllers.Api
{
	[Route("api/certificate")]
	public class CertificateController : Controller
	{
		[HttpGet]
		public async Task<IActionResult> Get([FromServices]CertificateWriter writer)
		{
			var result = await writer.Write($"{DateTime.Now.ToString("u")}.pdf", CourseCertificateVM.Mock);
			return Ok(result);
		}

		[HttpGet("/certificate/view")]
		public IActionResult ViewCertificate()
		{
			return View("Templates/Certificates/CourseCertificate", CourseCertificateVM.Mock);
		}
	}
}
