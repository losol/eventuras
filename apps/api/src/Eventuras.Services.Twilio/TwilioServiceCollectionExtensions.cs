using Eventuras.Services.Organizations.Settings;
using Eventuras.Services.Sms;
using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.Twilio
{
    public static class TwilioServiceCollectionExtensions
    {
        public static IServiceCollection AddConfigurableTwilioServices(this IServiceCollection services)
        {
            services.AddTransient<IOrganizationSettingsRegistryComponent,
                TwilioSettingsRegistryComponent>();

            services.AddTransient<IConfigurableSmsSenderComponent,
                TwilioSmsSenderComponent>();

            return services;
        }
    }
}
