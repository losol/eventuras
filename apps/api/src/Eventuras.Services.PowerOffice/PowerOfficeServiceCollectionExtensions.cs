using Eventuras.Services.Invoicing;
using Eventuras.Services.Organizations.Settings;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.PowerOffice
{
    public static class PowerOfficeServiceCollectionExtensions
    {
        public static IServiceCollection AddPowerOffice(this IServiceCollection services,
            IConfiguration configuration)
        {
            services.AddOptions<PowerOfficeOptions>()
                .ValidateDataAnnotations()
                .Bind(configuration);

            services.AddScoped<IInvoicingProvider, PowerOfficeService>();
            services.AddSingleton<IOrganizationSettingsRegistryComponent, PowerOfficeSettingsRegistryComponent>();

            return services;
        }
    }
}
