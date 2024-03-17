using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;

namespace Losol.Communication.HealthCheck.Abstractions;

public class HealthCheckMemoryStorage : IHealthCheckStorage
{
    private readonly ConcurrentDictionary<string, HealthCheckStatus> _checks =
        new ConcurrentDictionary<string, HealthCheckStatus>();

    public Task<HealthCheckStatus> GetCurrentStatusAsync(string serviceName)
    {
        if (_checks.TryGetValue(serviceName, out var status))
        {
            return Task.FromResult(status);
        }
        return Task.FromResult((HealthCheckStatus)null);
    }

    public Task CheckedAsync(string serviceName, HealthCheckStatus newStatus)
    {
        if (string.IsNullOrWhiteSpace(serviceName))
        {
            throw new ArgumentException(nameof(serviceName));
        }

        if (newStatus == null)
        {
            throw new ArgumentNullException(nameof(newStatus));
        }

        _checks.AddOrUpdate(serviceName, newStatus, (key, existingStatus) =>
            existingStatus.DateTime > newStatus.DateTime ? existingStatus : newStatus);

        return Task.CompletedTask;
    }
}
