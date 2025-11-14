using System.Net.Http;
using System.Net.Mime;
using System.Threading.Tasks;
using Eventuras.Libs.Pdf;
using Xunit;

namespace Eventuras.WebApi.Tests;

public static class HttpContentExtensions
{
    public static async Task<string> ReadAsPdfStringAsync(this HttpContent content)
    {
        Assert.Equal(MediaTypeNames.Application.Pdf, content.Headers.ContentType?.MediaType);

        await using var contentStream = await content.ReadAsStreamAsync();
        return PdfTextExtractor.ExtractText(contentStream);
    }
}
