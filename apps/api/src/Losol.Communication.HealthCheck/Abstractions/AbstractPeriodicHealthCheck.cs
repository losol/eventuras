using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Losol.Communication.HealthCheck.Abstractions;

/// <summary>
///     Performs health check periodically. If check was recently made by the
///     health check service itself (like, when email is successfully sent
///     or failed), then the next planned check is postponed.
/// </summary>
public abstract class AbstractPeriodicHealthCheck : IHealthCheck
{
    private readonly IHealthCheckService _healthCheckService;


    private readonly IHealthCheckStorage _healthCheckStorage;

    protected AbstractPeriodicHealthCheck(IHealthCheckStorage healthCheckStorage,
        IHealthCheckService healthCheckService)
    {
        _healthCheckStorage = healthCheckStorage ?? throw new ArgumentNullException(nameof(healthCheckStorage));
        _healthCheckService = healthCheckService ?? throw new ArgumentNullException(nameof(healthCheckService));
    }

    protected abstract string ServiceName { get; }

    protected abstract TimeSpan CheckPeriod { get; }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context,
        CancellationToken cancellationToken = new())
    {
        var healthStatus = await _healthCheckStorage.GetCurrentStatusAsync(ServiceName);
        if (healthStatus == null || healthStatus.DateTime + CheckPeriod < DateTime.UtcNow)
        {
            healthStatus = await _healthCheckService.CheckHealthAsync(cancellationToken);
            await _healthCheckStorage.CheckedAsync(ServiceName, healthStatus);
        }

        return healthStatus.Status switch
        {
            HealthStatus.Healthy => HealthCheckResult.Healthy(),
            _ => HealthCheckResult.Unhealthy(healthStatus.ErrorMessage)
        };
    }
}
