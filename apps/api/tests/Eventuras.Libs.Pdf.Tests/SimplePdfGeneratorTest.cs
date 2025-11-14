using System.IO;
using Xunit;

namespace Eventuras.Libs.Pdf.Tests;

public class SimplePdfGeneratorTest
{
    [Fact]
    public void GenerateFromText_Should_Create_Valid_Pdf()
    {
        // Arrange
        const string testText = "Hello World";

        // Act
        using var pdfStream = SimplePdfGenerator.GenerateFromText(testText);

        // Assert
        Assert.NotNull(pdfStream);
        Assert.True(pdfStream.Length > 0);

        // Verify it's a valid PDF by checking header
        pdfStream.Seek(0, SeekOrigin.Begin);
        var reader = new StreamReader(pdfStream);
        var header = reader.ReadLine();
        Assert.StartsWith("%PDF-", header);
    }

    [Fact]
    public void GenerateFromText_Should_Include_Text_Content()
    {
        // Arrange
        const string testText = "Test Content";

        // Act
        using var pdfStream = SimplePdfGenerator.GenerateFromText(testText);

        // Assert
        var extractedText = PdfTextExtractor.ExtractText(pdfStream);
        Assert.Equal(testText, extractedText);
    }

    [Theory]
    [InlineData(PaperSize.A4)]
    [InlineData(PaperSize.A5)]
    [InlineData(PaperSize.Letter)]
    [InlineData(PaperSize.Legal)]
    public void GenerateFromText_Should_Support_Different_Paper_Sizes(PaperSize paperSize)
    {
        // Arrange
        const string testText = "Paper size test";

        // Act
        using var pdfStream = SimplePdfGenerator.GenerateFromText(testText, paperSize);

        // Assert
        Assert.NotNull(pdfStream);
        Assert.True(pdfStream.Length > 0);

        var extractedText = PdfTextExtractor.ExtractText(pdfStream);
        Assert.Equal(testText, extractedText);
    }

    [Fact]
    public void GenerateFromText_Should_Escape_Special_Characters()
    {
        // Arrange
        const string testText = "Text with (parentheses)";

        // Act
        using var pdfStream = SimplePdfGenerator.GenerateFromText(testText);

        // Assert
        var extractedText = PdfTextExtractor.ExtractText(pdfStream);
        Assert.Equal(testText, extractedText);
    }

    [Fact]
    public void GenerateFromText_Should_Handle_Empty_String()
    {
        // Arrange
        const string testText = "";

        // Act
        using var pdfStream = SimplePdfGenerator.GenerateFromText(testText);

        // Assert
        Assert.NotNull(pdfStream);
        Assert.True(pdfStream.Length > 0);

        var extractedText = PdfTextExtractor.ExtractText(pdfStream);
        Assert.Equal("", extractedText);
    }

    [Fact]
    public void GenerateFromText_Should_Replace_Newlines_With_Spaces()
    {
        // Arrange
        const string testText = "Line1\nLine2\rLine3\r\nLine4";

        // Act
        using var pdfStream = SimplePdfGenerator.GenerateFromText(testText);

        // Assert
        var extractedText = PdfTextExtractor.ExtractText(pdfStream);
        // Newlines should be converted to spaces
        Assert.DoesNotContain("\n", extractedText);
        Assert.DoesNotContain("\r", extractedText);
    }
}
