using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Eventuras.Infrastructure.HealthChecks;

/// <summary>
///     Reports <see cref="HealthStatus.Degraded" /> when the database schema is
///     behind the deployed code — i.e. EF Core migrations exist in the assembly
///     that have not been applied to the database (migrations are applied
///     out-of-band here, not at startup).
///
///     Deliberately Degraded, never Unhealthy: a pending migration must NOT flip
///     the Kubernetes probes and trigger a reboot. It is tagged "diagnostics" and
///     excluded from the probe /health endpoint, then surfaced to admins via
///     /health/diagnostics.
/// </summary>
public sealed class PendingMigrationsHealthCheck : IHealthCheck
{
    private readonly ApplicationDbContext _db;

    public PendingMigrationsHealthCheck(ApplicationDbContext db) => _db = db;

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var pending = (await _db.Database.GetPendingMigrationsAsync(cancellationToken)).ToArray();

            if (pending.Length == 0)
            {
                return HealthCheckResult.Healthy("Database schema is up to date.");
            }

            return HealthCheckResult.Degraded(
                $"{pending.Length} pending migration(s) not applied.",
                data: new Dictionary<string, object> { ["pending"] = pending });
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            // Never Unhealthy: a transient DB hiccup while *checking* must not
            // turn this into a 503 (the contract is Degraded-only).
            return HealthCheckResult.Degraded("Could not determine pending migrations.", ex);
        }
    }
}
