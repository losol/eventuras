using System;
using System.IO;
using System.Text;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;

namespace Eventuras.Libs.Pdf;

/// <summary>
/// Extracts text content from PDF streams using PdfPig
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

        try
        {
            using var pdfDocument = PdfDocument.Open(pdfStream);
            var result = new StringBuilder();

            // Extract text from all pages
            foreach (Page page in pdfDocument.GetPages())
            {
                var text = page.Text;
                result.Append(text);
            }

            return result.ToString();
        }
        catch (Exception)
        {
            // Handle empty or invalid PDF streams
            return string.Empty;
        }
    }
}
