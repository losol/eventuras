using Eventuras.Services.Zoom.Client;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.Zoom
{
    internal class ZoomHealthCheck : IHealthCheck
    {
        private readonly IZoomApiClient _zoomApiClient;
        private readonly ILogger<ZoomHealthCheck> _logger;

        public ZoomHealthCheck(IZoomApiClient zoomApiClient, ILogger<ZoomHealthCheck> logger)
        {
            _zoomApiClient = zoomApiClient ?? throw new ArgumentNullException(nameof(zoomApiClient));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = new CancellationToken())
        {
            try
            {
                _logger.LogInformation("Performing Zoom API connection health check");
                await _zoomApiClient.HealthCheckAsync(cancellationToken);
                return HealthCheckResult.Healthy();
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Zoom API connection health check failed");
                return HealthCheckResult.Unhealthy(e.Message);
            }
        }
    }
}
