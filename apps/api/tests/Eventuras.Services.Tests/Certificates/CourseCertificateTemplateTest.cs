#nullable enable

using System;
using System.Threading.Tasks;
using Eventuras.Libs.DocComposer;
using Eventuras.Services.Certificates;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using Xunit;

namespace Eventuras.Services.Tests.Certificates;

public class CourseCertificateTemplateTest
{
    private const string TemplateName = "course-certificate";

    private sealed record SampleModel(
        string Title,
        string RecipientName,
        string? EvidenceDescription,
        string? Comment,
        string? Description,
        string? IssuerOrganizationName,
        string? IssuerOrganizationLogoDataUri,
        string IssuedInCity,
        string IssuedDate,
        string? IssuerPersonSignatureDataUri,
        string IssuerPersonName,
        string Uuid);

    private static FluidDocumentComposer CreateComposer()
    {
        // Plain EmbeddedFileProvider rather than ManifestEmbeddedFileProvider:
        // the manifest target collapses ".no"/".en" into a single resource path even with WithCulture=false.
        var provider = new EmbeddedFileProvider(
            typeof(CertificateViewModel).Assembly,
            "Eventuras.Services.Certificates.Templates");
        var options = Options.Create(new DocComposerOptions
        {
            TemplateFileProvider = provider,
            DefaultLocale = "nb"
        });
        return new FluidDocumentComposer(options);
    }

    private static SampleModel CreateSampleModel() => new(
        Title: "Avansert Fluid-templating",
        RecipientName: "Leo Losen",
        EvidenceDescription: "Workshop på Eventuras 2026",
        Comment: null,
        Description: null,
        IssuerOrganizationName: "Eventuras AS",
        IssuerOrganizationLogoDataUri: null,
        IssuedInCity: "Oslo",
        IssuedDate: "15.05.2026",
        IssuerPersonSignatureDataUri: null,
        IssuerPersonName: "Kursansvarlig Hansen",
        Uuid: Guid.NewGuid().ToString());

    [Fact]
    public async Task NorwegianTemplate_RendersWithExpectedFields()
    {
        var composer = CreateComposer();
        var model = CreateSampleModel();

        var rendered = await composer.ComposeAsync(TemplateName, model, "nb");

        Assert.Contains("<title>Kursbevis</title>", rendered.Html);
        Assert.Contains("Kursbevis", rendered.Html);
        Assert.Contains(model.Title, rendered.Html);
        Assert.Contains(model.RecipientName, rendered.Html);
        Assert.Contains("For deltakelse på " + model.EvidenceDescription, rendered.Html);
        Assert.Contains("Arrangert av " + model.IssuerOrganizationName, rendered.Html);
        Assert.Contains(model.IssuedInCity, rendered.Html);
        Assert.Contains(model.IssuedDate, rendered.Html);
        Assert.Contains(model.IssuerPersonName, rendered.Html);
        Assert.Contains(model.Uuid, rendered.Html);
    }

    [Fact]
    public async Task EnglishTemplate_RendersWithExpectedFields()
    {
        var composer = CreateComposer();
        var model = CreateSampleModel();

        var rendered = await composer.ComposeAsync(TemplateName, model, "en");

        Assert.Contains("<title>Certificate of Completion</title>", rendered.Html);
        Assert.Contains("Certificate of Completion", rendered.Html);
        Assert.Contains("Awarded to", rendered.Html);
        Assert.Contains("For participation in " + model.EvidenceDescription, rendered.Html);
        Assert.Contains("Organized by " + model.IssuerOrganizationName, rendered.Html);
        Assert.Contains("Course leader", rendered.Html);
        Assert.Contains(model.RecipientName, rendered.Html);
    }

    [Fact]
    public async Task OptionalSections_AreHidden_WhenFieldsAreNull()
    {
        var composer = CreateComposer();
        var model = CreateSampleModel() with
        {
            EvidenceDescription = null,
            Comment = null,
            Description = null,
            IssuerOrganizationName = null,
            IssuerOrganizationLogoDataUri = null,
            IssuerPersonSignatureDataUri = null
        };

        var rendered = await composer.ComposeAsync(TemplateName, model, "nb");

        Assert.DoesNotContain("For deltakelse på", rendered.Html);
        Assert.DoesNotContain("Arrangert av", rendered.Html);
        Assert.DoesNotContain("<img", rendered.Html);
        Assert.Contains("handwriting", rendered.Html);
    }
}
