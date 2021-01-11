using Microsoft.Extensions.Configuration;
using Eventuras.WebApi.Constants;

namespace Eventuras.WebApi.Extensions
{
    internal static class ConfigurationExtensions
    {
        public static bool HealthChecksEnabled(this IConfiguration configuration)
        {
            return configuration.GetSection(Constants.HealthChecks.HealthCheckConfigurationKey).HealthChecksEnabled();
        }

        public static bool HealthChecksEnabled(this IConfigurationSection configuration)
        {
            return configuration.GetValue<bool?>("Enabled") == true;
        }
    }
}
