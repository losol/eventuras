using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Threading.Tasks;

namespace Eventuras.Libs.Pdf;

public interface IPdfRenderService
{
    Task<Stream> GeneratePdfFromHtml(string html, PdfRenderOptions pdfRenderOptions);
}

public class PdfRenderOptions
{
    [Range(0.1, 2)] public float? Scale { get; set; }

    public PaperSize? PaperSize { get; set; }
}
