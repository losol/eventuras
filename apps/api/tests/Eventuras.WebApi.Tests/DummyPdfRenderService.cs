using System.IO;
using System.Threading.Tasks;
using Eventuras.Services.Pdf;
using iText.Kernel.Geom;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;

namespace Eventuras.WebApi.Tests;

public class DummyPdfRenderService : IPdfRenderService
{
    public Task<Stream> GeneratePdfFromHtml(string html, PdfRenderOptions pdfRenderOptions)
    {
        using var buffer = new MemoryStream();
        using var writer = new PdfWriter(buffer);
        using var pdfDoc = new PdfDocument(writer);
        using var document = new Document(pdfDoc, PageSize.A4);

        document.Add(new Paragraph(html));
        document.Close();

        var result = new MemoryStream();
        result.Write(buffer.GetBuffer());
        result.Seek(0, SeekOrigin.Begin);

        return Task.FromResult<Stream>(result);
    }
}
