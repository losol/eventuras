using System;
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

        // Resilient HttpClient for the Converto PDF service. Rendering runs a
        // headless browser and can be slow (and cold-start), so each attempt gets
        // a generous timeout, and transient failures (5xx, timeouts, connection
        // blips) are retried instead of surfacing to the user as a 500.
        services.AddHttpClient(ConvertoClient.HttpClientName)
            .AddStandardResilienceHandler(options =>
            {
                options.AttemptTimeout.Timeout = TimeSpan.FromSeconds(30);
                options.TotalRequestTimeout.Timeout = TimeSpan.FromSeconds(90);
                // CircuitBreaker.SamplingDuration must be at least 2x AttemptTimeout.
                options.CircuitBreaker.SamplingDuration = TimeSpan.FromSeconds(60);
                options.Retry.MaxRetryAttempts = 2;
            });

        // Separate client for the token endpoint, which is fast — keep its timeouts
        // short so an auth outage fails quickly instead of inheriting the long
        // PDF-render timeouts above.
        services.AddHttpClient(ConvertoClient.TokenHttpClientName)
            .AddStandardResilienceHandler(options =>
            {
                options.AttemptTimeout.Timeout = TimeSpan.FromSeconds(10);
                options.TotalRequestTimeout.Timeout = TimeSpan.FromSeconds(30);
                // CircuitBreaker.SamplingDuration must be at least 2x AttemptTimeout.
                options.CircuitBreaker.SamplingDuration = TimeSpan.FromSeconds(20);
                options.Retry.MaxRetryAttempts = 2;
            });

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
