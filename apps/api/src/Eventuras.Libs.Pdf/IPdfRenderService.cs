using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Threading.Tasks;

namespace Eventuras.Libs.Pdf;

public interface IPdfRenderService
{
    Task<Stream> GeneratePdfFromHtml(string html, PdfOptions PdfOptions);
}

public class PdfOptions
{
    [Range(0.1, 2)] public float? Scale { get; set; } = 1.0f;

    public PaperSize? PaperSize { get; set; } = Pdf.PaperSize.A4;
}
