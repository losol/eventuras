#nullable enable

using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using Xunit;

namespace Eventuras.Libs.DocComposer.Tests;

public class FluidEmailComposerTest : IDisposable
{
    public sealed record WelcomeModel(string Name, string EventTitle, string Url);

    private PhysicalFileProvider? _provider;

    private FluidEmailComposer CreateComposer()
    {
        var templatesDir = Path.Combine(AppContext.BaseDirectory, "Templates");
        _provider = new PhysicalFileProvider(templatesDir);
        var options = Options.Create(new DocComposerOptions
        {
            TemplateFileProvider = _provider,
            DefaultLocale = "en"
        });
        var documentComposer = new FluidDocumentComposer(options);
        return new FluidEmailComposer(documentComposer);
    }

    public void Dispose()
    {
        _provider?.Dispose();
    }

    [Fact]
    public async Task ComposeAsync_ExtractsSubjectFromTitle()
    {
        var composer = CreateComposer();
        var model = new WelcomeModel("Leo Losen", "Spring Workshop", "https://example.com/event/1");

        var result = await composer.ComposeAsync("welcome", model, "en");

        Assert.Equal("Welcome, Leo Losen!", result.Subject);
    }

    [Fact]
    public async Task ComposeAsync_ReturnsHtmlBody_FromDocumentComposer()
    {
        var composer = CreateComposer();
        var model = new WelcomeModel("Leo Losen", "Spring Workshop", "https://example.com/event/1");

        var result = await composer.ComposeAsync("welcome", model, "en");

        Assert.Contains("<h1>Hello Leo Losen</h1>", result.HtmlBody);
    }

    [Fact]
    public async Task ComposeAsync_DerivesPlainTextBody_FromRenderedHtml()
    {
        var composer = CreateComposer();
        var model = new WelcomeModel("Leo Losen", "Spring Workshop", "https://example.com/event/1");

        var result = await composer.ComposeAsync("welcome", model, "en");

        Assert.Contains("Hello Leo Losen", result.TextBody);
        Assert.Contains("click here (https://example.com/event/1)", result.TextBody);
        Assert.DoesNotContain("<h1>", result.TextBody);
        Assert.DoesNotContain("<p>", result.TextBody);
    }
}
