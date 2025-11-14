using System;
using System.IO;
using Xunit;

namespace Eventuras.Libs.Pdf.Tests;

public class PdfTextExtractorTest
{
    [Fact]
    public void ExtractText_Should_Throw_When_Stream_Is_Null()
    {
        // Act & Assert
        Assert.Throws<ArgumentNullException>(() => PdfTextExtractor.ExtractText(null!));
    }

    [Fact]
    public void ExtractText_Should_Extract_Text_From_Generated_Pdf()
    {
        // Arrange
        const string expectedText = "Sample Text Content";
        using var pdfStream = SimplePdfGenerator.GenerateFromText(expectedText);

        // Act
        var extractedText = PdfTextExtractor.ExtractText(pdfStream);

        // Assert
        Assert.Equal(expectedText, extractedText);
    }

    [Fact]
    public void ExtractText_Should_Handle_Empty_Pdf_Stream()
    {
        // Arrange
        using var emptyStream = new MemoryStream();

        // Act
        var extractedText = PdfTextExtractor.ExtractText(emptyStream);

        // Assert
        Assert.Equal(string.Empty, extractedText);
    }

    [Fact]
    public void ExtractText_Should_Unescape_Special_Characters()
    {
        // Arrange
        const string textWithSpecialChars = "Text with (parens)";
        using var pdfStream = SimplePdfGenerator.GenerateFromText(textWithSpecialChars);

        // Act
        var extractedText = PdfTextExtractor.ExtractText(pdfStream);

        // Assert
        Assert.Equal(textWithSpecialChars, extractedText);
    }

    [Fact]
    public void ExtractText_Should_Handle_Multiple_Text_Operations()
    {
        // Arrange - Generate PDF with content
        const string text1 = "First part";
        using var pdfStream = SimplePdfGenerator.GenerateFromText(text1);

        // Act
        var extractedText = PdfTextExtractor.ExtractText(pdfStream);

        // Assert
        Assert.Contains(text1, extractedText);
    }

    [Fact]
    public void ExtractText_Should_Be_Reusable_On_Seekable_Stream()
    {
        // Arrange
        const string expectedText = "Reusable Stream Test";
        using var pdfStream = SimplePdfGenerator.GenerateFromText(expectedText);

        // Act - Extract twice
        var firstExtraction = PdfTextExtractor.ExtractText(pdfStream);
        pdfStream.Seek(0, SeekOrigin.Begin); // Reset stream
        var secondExtraction = PdfTextExtractor.ExtractText(pdfStream);

        // Assert
        Assert.Equal(expectedText, firstExtraction);
        Assert.Equal(expectedText, secondExtraction);
        Assert.Equal(firstExtraction, secondExtraction);
    }
}
