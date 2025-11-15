using System.IO;
using System.Threading.Tasks;

namespace Eventuras.Libs.Pdf;

/// <summary>
/// Simple PDF render service implementation for testing and basic use cases.
/// Generates minimal valid PDFs from HTML/text content without external dependencies.
/// </summary>
public class SimplePdfRenderService : IPdfRenderService
{
    public Task<Stream> GeneratePdfFromHtml(string html, PdfOptions pdfOptions)
    {
        var stream = SimplePdfGenerator.GenerateFromText(html, pdfOptions);
        return Task.FromResult(stream);
    }
}
