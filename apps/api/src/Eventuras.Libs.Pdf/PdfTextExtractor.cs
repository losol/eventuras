using System;
using System.IO;
using System.Text;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;
using iText.Kernel.Pdf.Canvas.Parser.Listener;

namespace Eventuras.Libs.Pdf;

/// <summary>
/// Extracts text content from PDF streams
/// </summary>
public static class PdfTextExtractor
{
    /// <summary>
    /// Extracts text from a PDF stream
    /// </summary>
    /// <param name="pdfStream">The PDF stream to extract text from</param>
    /// <returns>The extracted text content</returns>
    public static string ExtractText(Stream pdfStream)
    {
        if (pdfStream == null)
            throw new ArgumentNullException(nameof(pdfStream));

        // Reset stream position if it's seekable
        if (pdfStream.CanSeek)
        {
            pdfStream.Position = 0;
        }

        using var pdfReader = new PdfReader(pdfStream);
        using var pdfDocument = new PdfDocument(pdfReader);

        var result = new StringBuilder();

        // Extract text from all pages
        for (int i = 1; i <= pdfDocument.GetNumberOfPages(); i++)
        {
            var page = pdfDocument.GetPage(i);
            var strategy = new SimpleTextExtractionStrategy();
            var text = PdfTextExtractor.GetTextFromPage(page, strategy);
            result.Append(text);
        }

        return result.ToString();
    }
}
