#nullable enable

using System;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Libs.Pdf;
using Eventuras.Services.Certificates;
using Moq;
using NodaTime;
using Xunit;

namespace Eventuras.Services.Tests.Certificates;

public class LiquidCertificateRendererTest
{
    private static CertificateViewModel CreateViewModel() =>
        new(new Certificate
        {
            Uuid = Guid.Parse("01234567-89ab-7cde-9012-3456789abcde"),
            Title = "Avansert Fluid-templating",
            RecipientName = "Leo Losen",
            EvidenceDescription = "Workshop på Eventuras 2026",
            IssuingOrganizationName = "Eventuras AS",
            IssuedByName = "Kursansvarlig Hansen",
            IssuedInCity = "Oslo",
            IssuedDate = new LocalDate(2026, 5, 15)
        });

    [Fact]
    public async Task RenderToHtmlAsStringAsync_NorwegianLocale_RendersWithExpectedFields()
    {
        var renderer = new LiquidCertificateRenderer(Mock.Of<IPdfRenderService>());
        var viewModel = CreateViewModel();

        var html = await renderer.RenderToHtmlAsStringAsync(viewModel, "no");

        Assert.Contains("Kursbevis", html);
        Assert.Contains("Avansert Fluid-templating", html);
        Assert.Contains("Leo Losen", html);
        Assert.Contains("For deltakelse på Workshop på Eventuras 2026", html);
        Assert.Contains("Arrangert av Eventuras AS", html);
        Assert.Contains("Oslo", html);
        Assert.Contains("15.05.2026", html);
        Assert.Contains("Kursansvarlig Hansen", html);
        Assert.Contains("01234567-89ab-7cde-9012-3456789abcde", html);
    }

    [Fact]
    public async Task RenderToHtmlAsStringAsync_EnglishLocale_RendersEnglishCopy()
    {
        var renderer = new LiquidCertificateRenderer(Mock.Of<IPdfRenderService>());
        var viewModel = CreateViewModel();

        var html = await renderer.RenderToHtmlAsStringAsync(viewModel, "en");

        Assert.Contains("Certificate of Completion", html);
        Assert.Contains("Awarded to", html);
        Assert.Contains("For participation in Workshop på Eventuras 2026", html);
        Assert.Contains("Organized by Eventuras AS", html);
        Assert.Contains("Course leader", html);
    }

    [Fact]
    public async Task RenderToHtmlAsStringAsync_UnknownLocale_FallsBackToDefaultNorwegianTemplate()
    {
        var renderer = new LiquidCertificateRenderer(Mock.Of<IPdfRenderService>());
        var viewModel = CreateViewModel();

        var html = await renderer.RenderToHtmlAsStringAsync(viewModel, "fr");

        Assert.Contains("Kursbevis", html);
    }

    [Fact]
    public async Task RenderToPdfAsStreamAsync_PassesRenderedHtml_ToPdfRenderService()
    {
        var pdfBytes = Encoding.UTF8.GetBytes("%PDF-1.4");
        string? capturedHtml = null;
        var pdfRenderService = new Mock<IPdfRenderService>();
        pdfRenderService
            .Setup(x => x.GeneratePdfFromHtml(It.IsAny<string>(), It.IsAny<PdfOptions>()))
            .Callback<string, PdfOptions>((html, _) => capturedHtml = html)
            .ReturnsAsync(new MemoryStream(pdfBytes));

        var renderer = new LiquidCertificateRenderer(pdfRenderService.Object);
        var viewModel = CreateViewModel();

        await using var pdfStream = await renderer.RenderToPdfAsStreamAsync(viewModel, "no");

        Assert.NotNull(capturedHtml);
        Assert.Contains("Kursbevis", capturedHtml);
        Assert.Contains("Leo Losen", capturedHtml);

        using var reader = new BinaryReader(pdfStream);
        var actualBytes = reader.ReadBytes(pdfBytes.Length);
        Assert.Equal(pdfBytes, actualBytes);
    }

    [Fact]
    public async Task RenderToHtmlAsStringAsync_NormalizesRegionalLocale_EnUS_ToEnglishTemplate()
    {
        var renderer = new LiquidCertificateRenderer(Mock.Of<IPdfRenderService>());
        var viewModel = CreateViewModel();

        var html = await renderer.RenderToHtmlAsStringAsync(viewModel, "en-US");

        Assert.Contains("Certificate of Completion", html);
        Assert.DoesNotContain("Kursbevis", html);
    }

    [Fact]
    public async Task RenderToHtmlAsStringAsync_NormalizesRegionalLocale_NbNO_ToNorwegianTemplate()
    {
        var renderer = new LiquidCertificateRenderer(Mock.Of<IPdfRenderService>());
        var viewModel = CreateViewModel();

        var html = await renderer.RenderToHtmlAsStringAsync(viewModel, "nb-NO");

        Assert.Contains("Kursbevis", html);
        Assert.DoesNotContain("Certificate of Completion", html);
    }

    [Fact]
    public async Task RenderToHtmlAsStringAsync_Throws_WhenViewModelIsNull()
    {
        var renderer = new LiquidCertificateRenderer(Mock.Of<IPdfRenderService>());

        await Assert.ThrowsAsync<ArgumentNullException>(() =>
            renderer.RenderToHtmlAsStringAsync(null!, "no"));
    }

    [Fact]
    public async Task RenderToHtmlAsStringAsync_Throws_WhenLocaleIsWhitespace()
    {
        var renderer = new LiquidCertificateRenderer(Mock.Of<IPdfRenderService>());
        var viewModel = CreateViewModel();

        await Assert.ThrowsAsync<ArgumentException>(() =>
            renderer.RenderToHtmlAsStringAsync(viewModel, "  "));
    }

    [Fact]
    public void Constructor_Throws_WhenPdfRenderServiceIsNull()
    {
        Assert.Throws<ArgumentNullException>(() =>
            new LiquidCertificateRenderer(null!));
    }

    [Fact]
    public async Task RenderToHtmlAsStringAsync_AcceptsCancellationToken()
    {
        var renderer = new LiquidCertificateRenderer(Mock.Of<IPdfRenderService>());
        var viewModel = CreateViewModel();
        using var cts = new CancellationTokenSource();

        var html = await renderer.RenderToHtmlAsStringAsync(viewModel, "no", cts.Token);

        Assert.Contains("Kursbevis", html);
    }
}
