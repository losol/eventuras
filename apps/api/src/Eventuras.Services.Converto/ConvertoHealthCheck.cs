using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.Converto;

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

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context,
        CancellationToken cancellationToken = new())
    {
        try
        {
            _logger.LogInformation("Performing converto service health check");
            await _convertoClient.GeneratePdfFromHtmlAsync(
                "<html><body><h1>Converto service health check</h1></body></html>", 1);
            _logger.LogInformation("Converto service health check was successful");
            return HealthCheckResult.Healthy();
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Converto service health check failed: {ExceptionMessage}", e.Message);
            return HealthCheckResult.Unhealthy(e.Message);
        }
    }
}
