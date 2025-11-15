using System.IO;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Eventuras.Libs.Pdf;

/// <summary>
/// Simple PDF generator for testing and basic use cases using QuestPDF
/// </summary>
public class SimplePdfGenerator
{
    static SimplePdfGenerator()
    {
        // Set QuestPDF license for community use
        QuestPDF.Settings.License = LicenseType.Community;
    }

    /// <summary>
    /// Generates a simple PDF with the given text content
    /// </summary>
    /// <param name="text">Text content to include in the PDF</param>
    /// <param name="options">Optional PDF rendering options (defaults to A4, scale 1.0)</param>
    /// <returns>A stream containing the generated PDF</returns>
    public static Stream GenerateFromText(string text, PdfOptions? options = null)
    {
        options ??= new PdfOptions();

        var stream = new MemoryStream();
        var paperSize = options.PaperSize ?? PaperSize.A4;
        var scale = options.Scale ?? 1.0f;
        var pageSize = MapPaperSize(paperSize);

        // Calculate font size based on scale
        var fontSize = 12 * scale;

        Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(pageSize);
                page.Margin(50);
                page.DefaultTextStyle(x => x.FontSize(fontSize));

                page.Content()
                    .Text(text)
                    .FontSize(fontSize);
            });
        }).GeneratePdf(stream);

        stream.Seek(0, SeekOrigin.Begin);
        return stream;
    }

    private static PageSize MapPaperSize(PaperSize paperSize)
    {
        return paperSize switch
        {
            PaperSize.Letter => QuestPDF.Helpers.PageSizes.Letter,
            PaperSize.Legal => QuestPDF.Helpers.PageSizes.Legal,
            PaperSize.Tabloid => QuestPDF.Helpers.PageSizes.Tabloid,
            PaperSize.Ledger => QuestPDF.Helpers.PageSizes.Ledger,
            PaperSize.A0 => QuestPDF.Helpers.PageSizes.A0,
            PaperSize.A1 => QuestPDF.Helpers.PageSizes.A1,
            PaperSize.A2 => QuestPDF.Helpers.PageSizes.A2,
            PaperSize.A3 => QuestPDF.Helpers.PageSizes.A3,
            PaperSize.A4 => QuestPDF.Helpers.PageSizes.A4,
            PaperSize.A5 => QuestPDF.Helpers.PageSizes.A5,
            _ => QuestPDF.Helpers.PageSizes.A4 // Default to A4
        };
    }
}
