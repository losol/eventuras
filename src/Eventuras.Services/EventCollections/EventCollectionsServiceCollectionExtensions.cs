using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.EventCollections
{
    internal static class EventCollectionsServiceCollectionExtensions
    {
        public static IServiceCollection AddEventCollectionServices(this IServiceCollection services)
        {
            services.AddTransient<IEventCollectionManagementService, EventCollectionManagementService>();
            services.AddTransient<IEventCollectionMappingService, EventCollectionMappingService>();
            return services;
        }
    }
}
