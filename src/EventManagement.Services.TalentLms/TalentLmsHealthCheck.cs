using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EventManagement.Services.TalentLms
{
    internal class TalentLmsHealthCheck : IHealthCheck
    {
        private readonly ITalentLmsApiService _talentLmsApiService;
        private readonly ILogger<TalentLmsHealthCheck> _logger;

        public TalentLmsHealthCheck(
            ITalentLmsApiService talentLmsApiService,
            ILogger<TalentLmsHealthCheck> logger)
        {
            _talentLmsApiService = talentLmsApiService ?? throw new ArgumentNullException(nameof(talentLmsApiService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = new CancellationToken())
        {
            try
            {
                _logger.LogInformation("Performing TalentLMS API connection health check");
                await _talentLmsApiService.ListAllUsersAsync(); // TODO: degraded if there is no users?
                return HealthCheckResult.Healthy();
            }
            catch (Exception e)
            {
                _logger.LogError(e, "TalentLMS API connection health failed");
                return HealthCheckResult.Unhealthy(e.Message);
            }
        }
    }
}
