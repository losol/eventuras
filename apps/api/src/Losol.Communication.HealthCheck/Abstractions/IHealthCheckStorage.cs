using System.Threading.Tasks;

namespace Losol.Communication.HealthCheck.Abstractions;

public interface IHealthCheckStorage
{
    Task<HealthCheckStatus> GetCurrentStatusAsync(string serviceName);

    Task CheckedAsync(string serviceName, HealthCheckStatus newStatus);
}
