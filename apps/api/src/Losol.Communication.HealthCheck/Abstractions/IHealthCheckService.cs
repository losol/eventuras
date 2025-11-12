using System.Threading;
using System.Threading.Tasks;

namespace Losol.Communication.HealthCheck.Abstractions;

public interface IHealthCheckService
{
    Task<HealthCheckStatus> CheckHealthAsync(CancellationToken cancellationToken = default);
}
