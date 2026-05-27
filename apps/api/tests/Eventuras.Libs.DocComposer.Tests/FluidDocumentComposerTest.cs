#nullable enable

using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using Xunit;

namespace Eventuras.Libs.DocComposer.Tests;

public class FluidDocumentComposerTest : IDisposable
{
    public sealed record WelcomeModel(string Name, string EventTitle, string Url);

    private PhysicalFileProvider? _provider;

    private FluidDocumentComposer CreateComposer(string defaultLocale = "en")
    {
        var templatesDir = Path.Combine(AppContext.BaseDirectory, "Templates");
        _provider = new PhysicalFileProvider(templatesDir);
        var options = Options.Create(new DocComposerOptions
        {
            TemplateFileProvider = _provider,
            DefaultLocale = defaultLocale
        });
        return new FluidDocumentComposer(options);
    }

    public void Dispose()
    {
        _provider?.Dispose();
    }

    [Fact]
    public async Task ComposeAsync_RendersTemplate_ReturnsHtml()
    {
        var composer = CreateComposer();
        var model = new WelcomeModel("Leo Losen", "Spring Workshop", "https://example.com/event/1");

        var result = await composer.ComposeAsync("welcome", model, "en");

        Assert.Contains("<h1>Hello Leo Losen</h1>", result.Html);
        Assert.Contains("Spring Workshop", result.Html);
    }

    [Fact]
    public async Task ComposeAsync_PicksRequestedLocale_WhenBothExist()
    {
        var composer = CreateComposer();
        var model = new WelcomeModel("Leo Losen", "Vårens kurs", "https://example.no");

        var result = await composer.ComposeAsync("welcome", model, "no");

        Assert.Contains("Hei Leo Losen", result.Html);
        Assert.Contains("Takk for at du meldte deg på Vårens kurs", result.Html);
    }

    [Fact]
    public async Task ComposeAsync_FallsBackToDefaultLocale_WhenRequestedLocaleMissing()
    {
        var composer = CreateComposer(defaultLocale: "en");
        var model = new WelcomeModel("Leo", string.Empty, string.Empty);

        var result = await composer.ComposeAsync("english-only", model, "no");

        Assert.Contains("This template exists only in English", result.Html);
    }

    [Fact]
    public async Task ComposeAsync_Throws_WhenTemplateNotFound()
    {
        var composer = CreateComposer();
        var model = new WelcomeModel("Leo", string.Empty, string.Empty);

        await Assert.ThrowsAsync<FileNotFoundException>(
            () => composer.ComposeAsync("nonexistent", model, "en"));
    }

    [Fact]
    public async Task ComposeAsync_MatchesTemplate_WhenLocaleCaseDiffers()
    {
        var composer = CreateComposer();
        var model = new WelcomeModel("Leo Losen", "Spring Workshop", "https://example.com");

        var result = await composer.ComposeAsync("welcome", model, "EN");

        Assert.Contains("Hello Leo Losen", result.Html);
    }

    [Fact]
    public void Constructor_Throws_WhenDefaultLocaleIsWhitespace()
    {
        var templatesDir = Path.Combine(AppContext.BaseDirectory, "Templates");
        using var provider = new PhysicalFileProvider(templatesDir);
        var options = Options.Create(new DocComposerOptions
        {
            TemplateFileProvider = provider,
            DefaultLocale = "  "
        });

        Assert.Throws<InvalidOperationException>(() => new FluidDocumentComposer(options));
    }
}
