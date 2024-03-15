using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Threading.Tasks;

namespace Eventuras.Services.Pdf;

public interface IPdfRenderService
{
    Task<Stream> RenderHtmlAsync(string html, PdfRenderOptions pdfRenderOptions);
}

public class PdfRenderOptions
{
    [Range(minimum: 0.1, maximum: 2)]
    public float? Scale { get; set; }

    public string Format { get; set; }
}
