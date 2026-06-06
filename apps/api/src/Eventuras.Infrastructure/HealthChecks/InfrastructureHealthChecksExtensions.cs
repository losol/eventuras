using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Eventuras.Infrastructure.HealthChecks;

public static class InfrastructureHealthChecksExtensions
{
    /// <summary>
    ///     Registers infrastructure (database) health checks. Tagged "diagnostics"
    ///     so they are surfaced to admins via /health/diagnostics and kept off the
    ///     Kubernetes probe /health endpoint. (Tag constant lives in ServiceDefaults
    ///     for the host wiring; kept as a literal here to avoid a host dependency.)
    /// </summary>
    public static IServiceCollection AddInfrastructureHealthChecks(this IServiceCollection services)
    {
        services.Configure<HealthCheckServiceOptions>(options =>
            options.Registrations.Add(new HealthCheckRegistration(
                "database-migrations",
                ActivatorUtilities.GetServiceOrCreateInstance<PendingMigrationsHealthCheck>,
                // Defense in depth: if an exception ever escapes the check, the
                // framework still treats it as Degraded, never Unhealthy.
                failureStatus: HealthStatus.Degraded,
                tags: new[] { "diagnostics" })));

        return services;
    }
}
