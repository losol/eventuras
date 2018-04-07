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
		private readonly string filePath;
		private readonly string scriptPath;
		private readonly INodeServices _nodeServices;
		private readonly IRenderService _renderService;
		public CertificateWriter(INodeServices nodeServices, 
			IHostingEnvironment environment,
			IRenderService renderService)
		{
			_nodeServices = nodeServices;
			filePath = Path.Combine(environment.ContentRootPath, "certificates");
			scriptPath = Path.Combine(environment.ContentRootPath, "Node", "pdf-a4-portrait.js");
			if(!Directory.Exists(filePath))
			{
				Directory.CreateDirectory(filePath);
			}
			_renderService = renderService;
		}

		public async Task<bool?> Write(string filename, CertificateVM vm)
		{
			var filepath = GetPathForFile(filename);
			var html = await _renderService.RenderViewToStringAsync(TEMPLATE, vm);
			var options = new // options passed to html-pdf
			{ 
				format = "A4"
			}; 

			return await _nodeServices.InvokeAsync<bool?>(
				SCRIPT,
				filepath,
				html,
				options
			);
		}

		public string GetPathForFile(string filename)
		{
			return Path.Combine(filePath, filename);
		}
	}
}
