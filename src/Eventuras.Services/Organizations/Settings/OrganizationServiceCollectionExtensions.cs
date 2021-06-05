using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.Organizations.Settings
{
    internal static class OrganizationSettingsServiceCollectionExtensions
    {
        public static IServiceCollection AddOrganizationSettingsServices(this IServiceCollection services)
        {
            services.AddTransient<IOrganizationSettingsCache, OrganizationSettingsCache>();
            services.AddTransient<IOrganizationSettingsAccessorService, OrganizationSettingsAccessorService>();
            services.AddTransient<IOrganizationSettingsManagementService, OrganizationSettingsManagementService>();
            services.AddTransient<IOrganizationSettingsRegistry, OrganizationSettingsRegistry>();
            return services;
        }
    }
}
