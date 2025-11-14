using System.IO;
using System.Threading.Tasks;

namespace Eventuras.Libs.Pdf;

/// <summary>
/// Simple PDF render service implementation for testing and basic use cases.
/// Generates minimal valid PDFs from HTML/text content without external dependencies.
/// </summary>
public class SimplePdfRenderService : IPdfRenderService
{
    public Task<Stream> GeneratePdfFromHtml(string html, PdfRenderOptions pdfRenderOptions)
    {
        var paperSize = pdfRenderOptions.PaperSize ?? PaperSize.A4;
        var scale = pdfRenderOptions.Scale ?? 1.0f;

        var stream = SimplePdfGenerator.GenerateFromText(html, paperSize, scale);
        return Task.FromResult(stream);
    }
}
