using System;
using System.IO;
using System.Threading.Tasks;
using DinkToPdf;
using DinkToPdf.Contracts;
using losol.EventManagement.Web.ViewModels.Templates;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.NodeServices;
using Microsoft.AspNetCore.NodeServices.HostingModels;

namespace losol.EventManagement.Web.Services
{
    public class CertificatePdfRenderer
    {
        private const string SCRIPT = "./Node/writeToPdf";
        private const string TEMPLATE = "Templates/Certificates/CourseCertificate";
        private readonly object OPTIONS = new { format = "A4", timeout = 50_000 }; // options passed to html-pdf 
        private readonly INodeServices _nodeServices;
        private readonly IRenderService _renderService;
		private readonly IConverter _converter;
        public CertificatePdfRenderer(INodeServices nodeServices,
            IHostingEnvironment environment,
			IConverter convertor,
            IRenderService renderService)
        {
            _nodeServices = nodeServices;
            _renderService = renderService;
			_converter = convertor;
        }

        public async Task<Stream> RenderAsync(CertificateVM vm)
        {
            var html = await _renderService.RenderViewToStringAsync(TEMPLATE, vm);
            var doc = new HtmlToPdfDocument()
            {
                GlobalSettings = 
				{
					ColorMode = ColorMode.Color,
					Orientation = Orientation.Portrait,
					PaperSize = PaperKind.A4,
				},
                Objects = 
				{
					new ObjectSettings() 
					{
						PagesCount = false,
						HtmlContent = html,
						WebSettings = { DefaultEncoding = "utf-8" },
						HeaderSettings = { FontSize = 9, Right = "Page [page] of [toPage]", Line = true, Spacing = 2.812 }
					}
				}
            };
			return new MemoryStream(_converter.Convert(doc));
        }
    }
}
