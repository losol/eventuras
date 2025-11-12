using Microsoft.Extensions.Configuration;

namespace Eventuras.WebApi.Extensions;

internal static class ConfigurationExtensions
{
    public static bool HealthChecksEnabled(this IConfiguration configuration) => configuration
        .GetSection(Constants.HealthChecks.HealthCheckConfigurationKey).HealthChecksEnabled();

    public static bool HealthChecksEnabled(this IConfigurationSection configuration) =>
        configuration.GetValue<bool?>("Enabled") == true;
}
