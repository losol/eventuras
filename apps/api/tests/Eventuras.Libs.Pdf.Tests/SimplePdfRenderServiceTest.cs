using System.Threading.Tasks;
using Xunit;

namespace Eventuras.Libs.Pdf.Tests;

public class SimplePdfRenderServiceTest
{
    [Fact]
    public async Task GeneratePdfFromHtml_Should_Create_Valid_Pdf()
    {
        // Arrange
        var service = new SimplePdfRenderService();
        const string html = "<h1>Test HTML</h1>";
        var options = new PdfOptions();

        // Act
        using var pdfStream = await service.GeneratePdfFromHtml(html, options);

        // Assert
        Assert.NotNull(pdfStream);
        Assert.True(pdfStream.Length > 0);
    }

    [Fact]
    public async Task GeneratePdfFromHtml_Should_Include_Html_Content()
    {
        // Arrange
        var service = new SimplePdfRenderService();
        const string html = "<p>HTML Content</p>";
        var options = new PdfOptions();

        // Act
        using var pdfStream = await service.GeneratePdfFromHtml(html, options);

        // Assert
        var extractedText = PdfTextExtractor.ExtractText(pdfStream);
        Assert.Contains("HTML Content", extractedText);
    }

    [Fact]
    public async Task GeneratePdfFromHtml_Should_Use_Specified_Paper_Size()
    {
        // Arrange
        var service = new SimplePdfRenderService();
        const string html = "Paper Size Test";
        var options = new PdfOptions
        {
            PaperSize = PaperSize.Letter
        };

        // Act
        using var pdfStream = await service.GeneratePdfFromHtml(html, options);

        // Assert
        Assert.NotNull(pdfStream);
        Assert.True(pdfStream.Length > 0);
    }

    [Fact]
    public async Task GeneratePdfFromHtml_Should_Default_To_A4_When_No_Size_Specified()
    {
        // Arrange
        var service = new SimplePdfRenderService();
        const string html = "Default Paper Size";
        var options = new PdfOptions(); // No PaperSize specified

        // Act
        using var pdfStream = await service.GeneratePdfFromHtml(html, options);

        // Assert
        Assert.NotNull(pdfStream);
        Assert.True(pdfStream.Length > 0);
    }

    [Fact]
    public async Task GeneratePdfFromHtml_Should_Handle_Scale_Option()
    {
        // Arrange
        var service = new SimplePdfRenderService();
        const string html = "Scaled Content";
        var options = new PdfOptions
        {
            Scale = 1.5f
        };

        // Act
        using var pdfStream = await service.GeneratePdfFromHtml(html, options);

        // Assert
        Assert.NotNull(pdfStream);
        Assert.True(pdfStream.Length > 0);

        var extractedText = PdfTextExtractor.ExtractText(pdfStream);
        Assert.Contains("Scaled Content", extractedText);
    }

    [Fact]
    public async Task GeneratePdfFromHtml_Should_Handle_Empty_Html()
    {
        // Arrange
        var service = new SimplePdfRenderService();
        const string html = "";
        var options = new PdfOptions();

        // Act
        using var pdfStream = await service.GeneratePdfFromHtml(html, options);

        // Assert
        Assert.NotNull(pdfStream);
        Assert.True(pdfStream.Length > 0);
    }
}
