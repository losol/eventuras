using Eventuras.Services.Pdf;
using iTextSharp.text;
using iTextSharp.text.pdf;
using System.IO;
using System.Threading.Tasks;

namespace Eventuras.WebApi.Tests
{
    public class DummyPdfRenderService : IPdfRenderService
    {
        public Task<Stream> RenderHtmlAsync(string html, PdfRenderOptions pdfRenderOptions)
        {
            using var stream = new MemoryStream();
            var document = new Document(PageSize.A4);
            var writer = PdfWriter.GetInstance(document, stream);
            document.Open();
            document.Add(new Paragraph(html));
            document.Close();
            writer.Close();
            Stream result = new MemoryStream(stream.GetBuffer());
            return Task.FromResult(result);
        }
    }
}
