using System;
using System.IO;
using System.Threading.Tasks;
using losol.EventManagement.Web.ViewModels.Templates;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.NodeServices;
using Microsoft.AspNetCore.NodeServices.HostingModels;

namespace losol.EventManagement.Web.Services
{
	public class CertificateWriter
	{
		private const string SCRIPT = "./Node/writeToPdf";
		private const string TEMPLATE = "Templates/Certificates/CourseCertificate";
		private readonly INodeServices _nodeServices;
		private readonly IRenderService _renderService;
		public CertificateWriter(INodeServices nodeServices, 
			IHostingEnvironment environment,
			IRenderService renderService)
		{
			_nodeServices = nodeServices;
			_renderService = renderService;
		}

		public async Task<Stream> Write(CertificateVM vm)
		{
			var html = await _renderService.RenderViewToStringAsync(TEMPLATE, vm);
			var options = new // options passed to html-pdf
			{ 
				format = "A4",
				timeout = 50_000
			}; 

			return await _nodeServices.InvokeAsync<Stream>(
				SCRIPT,
				html,
				options
			);
		}
	}
}
