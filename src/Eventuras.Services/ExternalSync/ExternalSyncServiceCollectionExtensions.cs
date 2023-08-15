using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.ExternalSync;

internal static class ExternalSyncServiceCollectionExtensions
{
    public static IServiceCollection AddExternalSyncServices(this IServiceCollection services)
    {
        services.AddTransient<IEventSynchronizationService, EventSynchronizationService>();
        services.AddTransient<IExternalEventManagementService, ExternalEventManagementService>();
        return services;
    }
}