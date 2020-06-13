using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.Converto
{
    internal class ConvertoHealthCheck : IHealthCheck
    {
        private readonly IConvertoClient _convertoClient;
        private readonly ILogger<ConvertoHealthCheck> _logger;

        public ConvertoHealthCheck(
            IConvertoClient convertoClient,
            ILogger<ConvertoHealthCheck> logger)
        {
            _convertoClient = convertoClient ?? throw new ArgumentNullException(nameof(convertoClient));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = new CancellationToken())
        {
            try
            {
                _logger.LogInformation("Performing converto service health check");
                await _convertoClient.LoginAsync();
                _logger.LogInformation("Converto service health check was successful");
                return HealthCheckResult.Healthy();
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Converto service health check failed: {message}", e.Message);
                return HealthCheckResult.Unhealthy(e.Message);
            }
        }
    }
}
