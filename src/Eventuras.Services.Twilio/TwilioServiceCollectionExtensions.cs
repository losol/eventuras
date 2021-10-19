using Eventuras.Services.Organizations.Settings;
using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.Twilio
{
    public static class TwilioServiceCollectionExtensions
    {
        public static IServiceCollection AddConfigurableTwilioServices(this IServiceCollection services)
        {
            services.AddTransient<IOrganizationSettingsRegistryComponent,
                TwilioSettingsRegistryComponent>();

            return services;
        }
    }
}
