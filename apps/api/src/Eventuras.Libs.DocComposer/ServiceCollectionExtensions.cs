using System;
using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Libs.DocComposer;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddFluidDocComposer(
        this IServiceCollection services,
        Action<DocComposerOptions> configure)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(configure);

        services.AddOptions<DocComposerOptions>()
            .Configure(configure)
            .Validate(o => o.TemplateFileProvider is not null,
                $"{nameof(DocComposerOptions.TemplateFileProvider)} must be configured.")
            .Validate(o => !string.IsNullOrWhiteSpace(o.DefaultLocale),
                $"{nameof(DocComposerOptions.DefaultLocale)} must be a non-empty value.")
            .ValidateOnStart();

        services.AddSingleton<IDocumentComposer, FluidDocumentComposer>();
        services.AddSingleton<IEmailComposer, FluidEmailComposer>();
        return services;
    }
}
