using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.Registrations;

internal static class RegistrationServiceCollectionExtensions
{
    public static IServiceCollection AddRegistrationServices(this IServiceCollection services)
    {
        services.AddTransient<IRegistrationRetrievalService, RegistrationRetrievalService>();
        services.AddTransient<IRegistrationExportService, RegistrationExportService>();
        services.AddTransient<IRegistrationAccessControlService, RegistrationAccessControlService>();
        services.AddTransient<IRegistrationManagementService, RegistrationManagementService>();
        return services;
    }
}
