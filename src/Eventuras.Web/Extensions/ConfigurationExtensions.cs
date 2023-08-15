using Microsoft.Extensions.Configuration;

namespace Eventuras.Web.Extensions;

internal static class ConfigurationExtensions
{
    public static bool HealthChecksEnabled(this IConfiguration configuration)
        => configuration.GetSection(Constants.HealthCheckConfigurationKey).HealthChecksEnabled();

    public static bool HealthChecksEnabled(this IConfigurationSection configuration) => configuration.GetValue<bool?>("Enabled") == true;
}