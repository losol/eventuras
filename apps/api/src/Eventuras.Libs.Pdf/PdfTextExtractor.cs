using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

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

        using var reader = new StreamReader(pdfStream, Encoding.ASCII, leaveOpen: true);
        var pdfContent = reader.ReadToEnd();

        // Extract text from PDF content streams using regex
        // Pattern looks for content between "stream" and "endstream" keywords
        var contentPattern = @"stream\s+(.*?)\s+endstream";
        var matches = Regex.Matches(pdfContent, contentPattern, RegexOptions.Singleline);

        var result = new StringBuilder();
        foreach (Match match in matches)
        {
            if (match.Groups.Count > 1)
            {
                var streamContent = match.Groups[1].Value;

                // Extract text from PDF text operators
                // Pattern: (text) Tj or [(text)] TJ
                var textPattern = @"\(([^)]*)\)\s*Tj";
                var textMatches = Regex.Matches(streamContent, textPattern);

                foreach (Match textMatch in textMatches)
                {
                    if (textMatch.Groups.Count > 1)
                    {
                        var text = UnescapePdfString(textMatch.Groups[1].Value);
                        result.Append(text);
                    }
                }
            }
        }

        return result.ToString();
    }

    private static string UnescapePdfString(string pdfString)
    {
        return pdfString
            .Replace("\\\\", "\\")
            .Replace("\\(", "(")
            .Replace("\\)", ")");
    }
}
