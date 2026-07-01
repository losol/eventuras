#nullable enable

using System;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Libs.DocComposer;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;

namespace Eventuras.Services.Registrations.Notifications;

/// <summary>Renders registration emails (receipt, waiting list) from embedded Liquid templates.</summary>
public sealed class RegistrationEmailRenderer
{
    private const string ReceiptTemplate = "registration-receipt";
    private const string WaitlistTemplate = "registration-waitlist";
    private const string DefaultLocale = "nb";
    private const string TemplateBaseNamespace = "Eventuras.Services.Registrations.Templates";

    private readonly IEmailComposer _emailComposer;

    public RegistrationEmailRenderer()
    {
        _emailComposer = new FluidEmailComposer(CreateDocumentComposer());
    }

    public Task<RenderedEmail> RenderReceiptAsync(
        RegistrationReceiptEmailModel model, string locale, CancellationToken cancellationToken = default) =>
        _emailComposer.ComposeAsync(ReceiptTemplate, model, NormalizeLocale(locale), cancellationToken);

    public Task<RenderedEmail> RenderWaitlistAsync(
        RegistrationWaitlistEmailModel model, string locale, CancellationToken cancellationToken = default) =>
        _emailComposer.ComposeAsync(WaitlistTemplate, model, NormalizeLocale(locale), cancellationToken);

    // Normalize to a language code; unknown languages pass through so the composer
    // can try that template and fall back to the default locale (nb) if it's missing.
    private static string NormalizeLocale(string? locale)
    {
        var lang = (locale ?? DefaultLocale).Split('-')[0].ToLowerInvariant();
        return lang == "no" ? "nb" : lang;
    }

    private static IDocumentComposer CreateDocumentComposer()
    {
        var provider = new EmbeddedFileProvider(
            typeof(RegistrationEmailRenderer).Assembly, TemplateBaseNamespace);
        return new FluidDocumentComposer(Options.Create(new DocComposerOptions
        {
            TemplateFileProvider = provider,
            DefaultLocale = DefaultLocale
        }));
    }
}
