#nullable enable

using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Libs.DocComposer;
using Eventuras.Libs.Pdf;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;

namespace Eventuras.Services.Certificates;

internal sealed class LiquidCertificateRenderer
{
    private const string TemplateName = "course-certificate";
    private const string DefaultLocale = "nb";
    private const string TemplateBaseNamespace = "Eventuras.Services.Certificates.Templates";

    private readonly IDocumentComposer _documentComposer;
    private readonly IPdfRenderService _pdfRenderService;

    public LiquidCertificateRenderer(IPdfRenderService pdfRenderService)
    {
        ArgumentNullException.ThrowIfNull(pdfRenderService);
        _pdfRenderService = pdfRenderService;
        _documentComposer = CreateDocumentComposer();
    }

    public async Task<string> RenderToHtmlAsStringAsync(
        CertificateViewModel viewModel,
        string locale,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(viewModel);
        ArgumentException.ThrowIfNullOrWhiteSpace(locale);

        var templateLocale = NormalizeToTemplateLocale(locale);
        var model = CourseCertificateModelMapper.FromViewModel(viewModel, locale);
        var rendered = await _documentComposer.ComposeAsync(TemplateName, model, templateLocale, cancellationToken);
        return rendered.Html;
    }

    // Collapse regional tags (en-US, nb-NO, nn-NO, ...) to their language root.
    // The macrolanguage tag "no" maps to Bokmål. "nn" stays as "nn" so a future
    // course-certificate.nn.liquid is picked up automatically; until that exists,
    // DocComposer falls back to the configured default (nb). Unknown languages pass
    // through so DocComposer can apply the same fallback.
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

    public async Task<Stream> RenderToPdfAsStreamAsync(
        CertificateViewModel viewModel,
        string locale,
        CancellationToken cancellationToken = default)
    {
        var html = await RenderToHtmlAsStringAsync(viewModel, locale, cancellationToken);
        return await _pdfRenderService.GeneratePdfFromHtml(html,
            new PdfOptions { PaperSize = PaperSize.A4, Scale = 0.8f });
    }

    private static FluidDocumentComposer CreateDocumentComposer()
    {
        // Plain EmbeddedFileProvider rather than ManifestEmbeddedFileProvider:
        // the manifest target collapses ".no"/".en" into a single resource path even with WithCulture=false.
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
