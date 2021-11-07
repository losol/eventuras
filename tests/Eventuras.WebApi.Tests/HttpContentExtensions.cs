using System.Net.Http;
using System.Net.Mime;
using System.Threading.Tasks;
using iTextSharp.text.pdf;
using iTextSharp.text.pdf.parser;
using Xunit;

namespace Eventuras.WebApi.Tests
{
    public static class HttpContentExtensions
    {
        public static async Task<string> ReadAsPdfStringAsync(this HttpContent content)
        {
            Assert.Equal(MediaTypeNames.Application.Pdf, content.Headers.ContentType?.MediaType);
            await using var stream = await content.ReadAsStreamAsync();
            using var reader = new PdfReader(stream);
            var text = string.Empty;
            for (var page = 1; page <= reader.NumberOfPages; page++)
            {
                text += PdfTextExtractor.GetTextFromPage(reader, page);
            }
            return text;
        }
    }
}
