using System.Net.Http;
using System.Net.Mime;
using System.Text;
using System.Threading.Tasks;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;
using Xunit;

namespace Eventuras.WebApi.Tests
{
    public static class HttpContentExtensions
    {
        public static async Task<string> ReadAsPdfStringAsync(this HttpContent content)
        {
            Assert.Equal(MediaTypeNames.Application.Pdf, content.Headers.ContentType?.MediaType);

            await using var contentStream = await content.ReadAsStreamAsync();
            using var reader = new PdfReader(contentStream);
            using var pdfDocument = new PdfDocument(reader);
            
            var pages = pdfDocument.GetNumberOfPages();
            var textBuilder = new StringBuilder();
            for (var i = 0; i < pages; i++)
            {
                var text = PdfTextExtractor.GetTextFromPage(pdfDocument.GetPage(i + 1));
                textBuilder.Append(text);
            }

            return textBuilder.ToString();
        }
    }
}