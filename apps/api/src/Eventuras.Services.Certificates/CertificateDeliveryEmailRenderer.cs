#nullable enable

using System;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Libs.DocComposer;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;

namespace Eventuras.Services.Certificates;

internal sealed class CertificateDeliveryEmailRenderer
{
    private const string TemplateName = "certificate-delivery";
    private const string DefaultLocale = "nb";
    private const string TemplateBaseNamespace = "Eventuras.Services.Certificates.Templates";

    private readonly IEmailComposer _emailComposer;

    public CertificateDeliveryEmailRenderer()
    {
        _emailComposer = new FluidEmailComposer(CreateDocumentComposer());
    }

    public Task<RenderedEmail> RenderAsync(
        CertificateDeliveryEmailModel model,
        string locale,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(model);
        ArgumentException.ThrowIfNullOrWhiteSpace(locale);

        var templateLocale = NormalizeToTemplateLocale(locale);
        return _emailComposer.ComposeAsync(TemplateName, model, templateLocale, cancellationToken);
    }

    // Same normalisation rules as LiquidCertificateRenderer — the delivery email
    // and the certificate ship together, so they should resolve the same locale.
    private static string NormalizeToTemplateLocale(string locale)
    {
        var lang = locale.Split('-')[0].ToLowerInvariant();
        return lang switch
        {
            "nb" or "no" => "nb",
            "nn" => "nn",
            "en" => "en",
            _ => locale
        };
    }

    private static IDocumentComposer CreateDocumentComposer()
    {
        // Plain EmbeddedFileProvider rather than ManifestEmbeddedFileProvider:
        // the manifest target collapses ".nb"/".en" into a single resource path even with WithCulture=false.
        var provider = new EmbeddedFileProvider(
            typeof(CertificateViewModel).Assembly,
            TemplateBaseNamespace);
        return new FluidDocumentComposer(Options.Create(new DocComposerOptions
        {
            TemplateFileProvider = provider,
            DefaultLocale = DefaultLocale
        }));
    }
}
