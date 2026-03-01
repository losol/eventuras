using Eventuras.Libs.Pdf;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Eventuras.Services.Converto;

public static class ConvertoServicesExtensions
{
    public static IServiceCollection AddConvertoServices(this IServiceCollection services, IConfiguration config)
    {
        services.Configure<ConvertoConfig>(config);
        services.TryAddSingleton<IConvertoClient, ConvertoClient>();
        services.TryAddTransient<IPdfRenderService, ConvertoPdfRenderService>();

        // Registered with the "converto" tag so it is only exposed on /health/converto,
        // not on the /health endpoint used by Kubernetes probes.
        services.Configure<HealthCheckServiceOptions>(options =>
        {
            options.Registrations.Add(new HealthCheckRegistration("pdf",
                ActivatorUtilities.GetServiceOrCreateInstance<ConvertoHealthCheck>,
                null, new[] { "converto" }));
        });

        return services;
    }
}
