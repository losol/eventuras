using Eventuras.Services.ExternalSync;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Eventuras.Services.TalentLms
{
    public static class TalentLmsServiceCollectionExtensions
    {
        public static IServiceCollection AddTalentLmsIfEnabled(
            this IServiceCollection services,
            IConfigurationSection configuration)
        {
            if (configuration?.GetValue<bool>("Enabled") != true)
            {
                return services;
            }

            services.AddTransient<ITalentLmsApiService, TalentLmsApiService>();
            services.AddTransient<IExternalSyncProviderService, TalentLmsProviderService>();
            services.AddOptions<TalentLmsSettings>()
                .ValidateDataAnnotations()
                .Bind(configuration);

            if (configuration?.GetValue<bool>("DisableHealthChecks") != true)
            {
                services.Configure<HealthCheckServiceOptions>(options =>
                {
                    options.Registrations.Add(new HealthCheckRegistration("lms",
                        ActivatorUtilities.GetServiceOrCreateInstance<TalentLmsHealthCheck>,
                        null, null));
                });
            }

            return services;
        }
    }
}
