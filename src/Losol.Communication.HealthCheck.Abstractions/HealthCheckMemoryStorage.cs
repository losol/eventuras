using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Losol.Communication.HealthCheck.Abstractions
{
    public class HealthCheckMemoryStorage : IHealthCheckStorage
    {
        private readonly IDictionary<string, HealthCheckStatus> _checks =
            new Dictionary<string, HealthCheckStatus>();

        public Task<HealthCheckStatus> GetCurrentStatusAsync(string serviceName)
        {
            return Task.FromResult(_checks.ContainsKey(serviceName) ? _checks[serviceName] : null);
        }

        public Task CheckedAsync(string serviceName, HealthCheckStatus healthCheckStatus)
        {
            if (string.IsNullOrWhiteSpace(serviceName))
            {
                throw new ArgumentException(nameof(serviceName));
            }
            _checks.Add(serviceName, healthCheckStatus ?? throw new ArgumentNullException(nameof(healthCheckStatus)));
            return Task.CompletedTask;
        }
    }
}
