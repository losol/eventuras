using System.IO;
using iText.Kernel.Geom;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;

namespace Eventuras.Libs.Pdf;

/// <summary>
/// Simple PDF generator for testing and basic use cases using iText7
/// </summary>
public class SimplePdfGenerator
{
    /// <summary>
    /// Generates a simple PDF with the given text content
    /// </summary>
    /// <param name="text">Text content to include in the PDF</param>
    /// <param name="paperSize">Paper size for the PDF (defaults to A4)</param>
    /// <param name="scale">Scale factor for the document (applies to font size)</param>
    /// <returns>A stream containing the generated PDF</returns>
    public static Stream GenerateFromText(string text, PaperSize paperSize = PaperSize.A4, float scale = 1.0f)
    {
        var stream = new MemoryStream();
        var pageSize = MapPaperSize(paperSize);

        using (var writer = new PdfWriter(stream))
        {
            writer.SetCloseStream(false);

            using (var pdf = new PdfDocument(writer))
            using (var document = new Document(pdf, pageSize))
            {
                // Set margins
                document.SetMargins(50, 50, 50, 50);

                // Calculate font size based on scale
                var fontSize = 12 * scale;

                // Replace newlines with spaces for single-line output
                var processedText = text.Replace("\r\n", " ")
                                       .Replace("\n", " ")
                                       .Replace("\r", " ");

                // Add text with proper formatting
                var paragraph = new Paragraph(processedText)
                    .SetFontSize(fontSize)
                    .SetTextAlignment(TextAlignment.LEFT);

                document.Add(paragraph);
            }
        }

        stream.Seek(0, SeekOrigin.Begin);
        return stream;
    }

    private static PageSize MapPaperSize(PaperSize paperSize)
    {
        return paperSize switch
        {
            PaperSize.Letter => iText.Kernel.Geom.PageSize.LETTER,
            PaperSize.Legal => iText.Kernel.Geom.PageSize.LEGAL,
            PaperSize.Tabloid => iText.Kernel.Geom.PageSize.TABLOID,
            PaperSize.Ledger => iText.Kernel.Geom.PageSize.LEDGER,
            PaperSize.A0 => iText.Kernel.Geom.PageSize.A0,
            PaperSize.A1 => iText.Kernel.Geom.PageSize.A1,
            PaperSize.A2 => iText.Kernel.Geom.PageSize.A2,
            PaperSize.A3 => iText.Kernel.Geom.PageSize.A3,
            PaperSize.A4 => iText.Kernel.Geom.PageSize.A4,
            PaperSize.A5 => iText.Kernel.Geom.PageSize.A5,
            PaperSize.A6 => iText.Kernel.Geom.PageSize.A6,
            _ => iText.Kernel.Geom.PageSize.A4 // Default to A4
        };
    }
}
