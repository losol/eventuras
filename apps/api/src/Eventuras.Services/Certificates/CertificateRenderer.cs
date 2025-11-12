using System;
using System.IO;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Pdf;
using Eventuras.Services.Views;

namespace Eventuras.Services.Certificates;

internal class CertificateRenderer : ICertificateRenderer
{
    private const string ViewName = "Templates/Certificates/CourseCertificate";

    private readonly IPdfRenderService _pdfRenderService;
    private readonly IViewRenderService _viewRenderService;

    public CertificateRenderer(
        IViewRenderService viewRenderService,
        IPdfRenderService pdfRenderService)
    {
        _viewRenderService = viewRenderService ?? throw
            new ArgumentNullException(nameof(viewRenderService));

        _pdfRenderService = pdfRenderService ?? throw
            new ArgumentNullException(nameof(pdfRenderService));
    }

    public async Task<string> RenderToHtmlAsStringAsync(CertificateViewModel viewModel)
    {
        if (viewModel == null)
        {
            throw new ArgumentNullException(nameof(viewModel));
        }

        return await _viewRenderService.RenderViewToStringAsync(ViewName, viewModel);
    }

    public async Task<Stream> RenderToPdfAsStreamAsync(CertificateViewModel viewModel)
    {
        if (viewModel == null)
        {
            throw new ArgumentNullException(nameof(viewModel));
        }

        var html = await RenderToHtmlAsStringAsync(viewModel);
        return await _pdfRenderService.GeneratePdfFromHtml(html,
            new PdfRenderOptions { PaperSize = PaperSize.A4, Scale = 0.8f });
    }
}
