using System.IO;

namespace Eventuras.Libs.Pdf;

/// <summary>
/// Simple PDF generator for testing and basic use cases
/// </summary>
public class SimplePdfGenerator
{
    /// <summary>
    /// Generates a simple PDF with the given text content
    /// </summary>
    /// <param name="text">Text content to include in the PDF</param>
    /// <param name="paperSize">Paper size for the PDF (defaults to A4)</param>
    /// <param name="scale">Scale factor (not used in this simple implementation)</param>
    /// <returns>A stream containing the generated PDF</returns>
    public static Stream GenerateFromText(string text, PaperSize paperSize = PaperSize.A4, float scale = 1.0f)
    {
        var stream = new MemoryStream();
        var writer = new StreamWriter(stream);

        // Write a minimal PDF structure
        writer.Write("%PDF-1.4\n");
        writer.Write("1 0 obj\n");
        writer.Write("<< /Type /Catalog /Pages 2 0 R >>\n");
        writer.Write("endobj\n");
        writer.Write("2 0 obj\n");
        writer.Write("<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n");
        writer.Write("endobj\n");
        writer.Write("3 0 obj\n");
        writer.Write("<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 ");

        // Set page dimensions based on paper size (in points: 1 inch = 72 points)
        var (width, height) = GetPageDimensions(paperSize);
        writer.Write($"{width} {height}");
        writer.Write("] /Contents 5 0 R >>\n");
        writer.Write("endobj\n");
        writer.Write("4 0 obj\n");
        writer.Write("<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>\n");
        writer.Write("endobj\n");
        writer.Write("5 0 obj\n");

        var content = $"BT /F1 12 Tf 50 {height - 50} Td ({EscapePdfString(text)}) Tj ET";
        writer.Write($"<< /Length {content.Length} >>\n");
        writer.Write("stream\n");
        writer.Write(content);
        writer.Write("\nendstream\n");
        writer.Write("endobj\n");
        writer.Write("xref\n");
        writer.Write("0 6\n");
        writer.Write("0000000000 65535 f \n");
        writer.Write("0000000009 00000 n \n");
        writer.Write("0000000058 00000 n \n");
        writer.Write("0000000115 00000 n \n");
        writer.Write($"0000000{width.ToString().Length + height.ToString().Length + 224:D3} 00000 n \n");
        writer.Write($"0000000{width.ToString().Length + height.ToString().Length + 321:D3} 00000 n \n");
        writer.Write("trailer\n");
        writer.Write("<< /Size 6 /Root 1 0 R >>\n");
        writer.Write("startxref\n");
        writer.Write($"{width.ToString().Length + height.ToString().Length + content.Length + 391}\n");
        writer.Write("%%EOF\n");

        writer.Flush();
        stream.Seek(0, SeekOrigin.Begin);
        return stream;
    }

    private static (int width, int height) GetPageDimensions(PaperSize paperSize)
    {
        return paperSize switch
        {
            PaperSize.Letter => (612, 792),   // 8.5 x 11 inches
            PaperSize.Legal => (612, 1008),   // 8.5 x 14 inches
            PaperSize.Tabloid => (792, 1224), // 11 x 17 inches
            PaperSize.Ledger => (1224, 792),  // 17 x 11 inches
            PaperSize.A0 => (2384, 3370),
            PaperSize.A1 => (1684, 2384),
            PaperSize.A2 => (1191, 1684),
            PaperSize.A3 => (842, 1191),
            PaperSize.A4 => (595, 842),       // 210 x 297 mm
            PaperSize.A5 => (420, 595),
            PaperSize.A6 => (298, 420),
            _ => (595, 842) // Default to A4
        };
    }

    private static string EscapePdfString(string text)
    {
        return text
            .Replace("\\", "\\\\")
            .Replace("(", "\\(")
            .Replace(")", "\\)")
            .Replace("\n", " ")
            .Replace("\r", " ")
            .Replace("\t", " ");
    }
}
