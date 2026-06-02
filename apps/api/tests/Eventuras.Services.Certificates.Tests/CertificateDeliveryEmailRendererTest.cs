#nullable enable

using System.Threading.Tasks;
using Eventuras.Services.Certificates;
using Xunit;

namespace Eventuras.Services.Certificates.Tests;

public class CertificateDeliveryEmailRendererTest
{
    [Fact]
    public async Task RenderAsync_NorwegianLocale_ProducesBokmaalSubjectAndBody()
    {
        var renderer = new CertificateDeliveryEmailRenderer();
        var model = new CertificateDeliveryEmailModel("Avansert Fluid-templating", "Leo Losen");

        var result = await renderer.RenderAsync(model, "nb");

        Assert.Equal("Kursbevis for Avansert Fluid-templating", result.Subject);
        Assert.Contains("Hei Leo Losen", result.HtmlBody);
        Assert.Contains("Avansert Fluid-templating", result.HtmlBody);
        Assert.Contains("Gratulerer", result.HtmlBody);
        Assert.Contains("Hei Leo Losen", result.TextBody);
        Assert.DoesNotContain("<strong>", result.TextBody);
    }

    [Fact]
    public async Task RenderAsync_EnglishLocale_ProducesEnglishSubjectAndBody()
    {
        var renderer = new CertificateDeliveryEmailRenderer();
        var model = new CertificateDeliveryEmailModel("Advanced Fluid Templating", "Leo Losen");

        var result = await renderer.RenderAsync(model, "en");

        Assert.Equal("Certificate for Advanced Fluid Templating", result.Subject);
        Assert.Contains("Hello Leo Losen", result.HtmlBody);
        Assert.Contains("Congratulations", result.HtmlBody);
        Assert.Contains("Hello Leo Losen", result.TextBody);
    }

    [Fact]
    public async Task RenderAsync_NormalizesRegionalLocale_NbNO_ToBokmaal()
    {
        var renderer = new CertificateDeliveryEmailRenderer();
        var model = new CertificateDeliveryEmailModel("Vårens kurs", "Leo Losen");

        var result = await renderer.RenderAsync(model, "nb-NO");

        Assert.Equal("Kursbevis for Vårens kurs", result.Subject);
    }

    [Fact]
    public async Task RenderAsync_NormalizesRegionalLocale_EnUS_ToEnglish()
    {
        var renderer = new CertificateDeliveryEmailRenderer();
        var model = new CertificateDeliveryEmailModel("Advanced Course", "Leo Losen");

        var result = await renderer.RenderAsync(model, "en-US");

        Assert.Equal("Certificate for Advanced Course", result.Subject);
    }

    [Fact]
    public async Task RenderAsync_UnknownLocale_FallsBackToBokmaalTemplate()
    {
        var renderer = new CertificateDeliveryEmailRenderer();
        var model = new CertificateDeliveryEmailModel("Test Course", "Leo Losen");

        var result = await renderer.RenderAsync(model, "fr");

        Assert.Contains("Kursbevis", result.Subject);
    }

    [Fact]
    public async Task RenderAsync_EscapesHtmlInModelFields()
    {
        var renderer = new CertificateDeliveryEmailRenderer();
        var model = new CertificateDeliveryEmailModel(
            Title: "<script>alert('xss')</script>",
            RecipientName: "Leo & Co <admin>");

        var result = await renderer.RenderAsync(model, "nb");

        // HTML body must not contain raw script tags — they're escaped before rendering.
        // The Subject is plain text (email header) so the unescaped form is fine there.
        Assert.DoesNotContain("<script>", result.HtmlBody);
        Assert.Contains("&lt;script&gt;", result.HtmlBody);
        Assert.Contains("Leo &amp; Co &lt;admin&gt;", result.HtmlBody);
    }
}
