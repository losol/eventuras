using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.Organizations.Settings;

internal static class OrganizationSettingsServiceCollectionExtensions
{
    public static IServiceCollection AddOrganizationSettingsServices(this IServiceCollection services)
    {
        services.AddSingleton<IStartupService, OrganizationSettingsRegistryInitializer>();
        services.AddSingleton<IOrganizationSettingsRegistry, OrganizationSettingsRegistry>();
        services.AddTransient<IOrganizationSettingsCache, OrganizationSettingsCache>();
        services.AddTransient<IOrganizationSettingsAccessorService, OrganizationSettingsAccessorService>();
        services.AddTransient<IOrganizationSettingsManagementService, OrganizationSettingsManagementService>();
        return services;
    }
}