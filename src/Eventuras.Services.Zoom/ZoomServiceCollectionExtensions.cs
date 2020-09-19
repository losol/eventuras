using Eventuras.Services.ExternalSync;
using Eventuras.Services.Zoom.Client;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Eventuras.Services.Zoom
{
    public static class ZoomServiceCollectionExtensions
    {
        public static IServiceCollection AddZoomIfEnabled(this IServiceCollection services, IConfiguration configuration)
        {
            if (configuration?.GetValue<bool>("Enabled") != true)
            {
                return services;
            }

            services.AddTransient<IZoomApiClient, ZoomApiClient>();
            services.AddTransient<IExternalSyncProviderService, ZoomSyncProviderService>();

            services.AddOptions<ZoomSettings>()
                .ValidateDataAnnotations()
                .Bind(configuration);

            if (configuration?.GetValue<bool>("DisableHealthChecks") != true)
            {
                services.Configure<HealthCheckServiceOptions>(options =>
                {
                    options.Registrations.Add(new HealthCheckRegistration("zoom",
                        ActivatorUtilities.GetServiceOrCreateInstance<ZoomHealthCheck>,
                        null, null, null));
                });
            }

            return services;
        }
    }
}
