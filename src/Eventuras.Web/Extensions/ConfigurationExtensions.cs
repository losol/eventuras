using Microsoft.Extensions.Configuration;

namespace Eventuras.Web.Extensions
{
    internal static class ConfigurationExtensions
    {
        public static bool HealthChecksEnabled(this IConfiguration configuration)
        {
            return configuration.GetSection(Constants.HealthCheckConfigurationKey).HealthChecksEnabled();
        }

        public static bool HealthChecksEnabled(this IConfigurationSection configuration)
        {
            return configuration.GetValue<bool?>("Enabled") == true;
        }
    }
}
