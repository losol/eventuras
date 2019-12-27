using losol.EventManagement.Services.Pdf;
using losol.EventManagement.Web.ViewModels;
using System.IO;
using System.Threading.Tasks;

namespace losol.EventManagement.Web.Services
{
    public class CertificatePdfRenderer
    {
        private const string Template = "Templates/Certificates/CourseCertificate";

        private readonly IPdfRenderService _pdfRenderService;
        private readonly IRenderService _renderService;
        public CertificatePdfRenderer(
            IRenderService renderService,
            IPdfRenderService pdfRenderService)
        {
            _renderService = renderService;
            _pdfRenderService = pdfRenderService;
        }

        public async Task<Stream> RenderAsync(CertificateVM vm)
        {
            var html = await _renderService.RenderViewToStringAsync(Template, vm);
            return await _pdfRenderService.RenderHtmlAsync(html, new PdfRenderOptions
            {
                Format = "A4",
                Scale = 0.8f
            });
        }
    }
}
