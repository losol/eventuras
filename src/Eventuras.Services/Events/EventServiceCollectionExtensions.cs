using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.Events
{
    internal static class EventServiceCollectionExtensions
    {
        public static IServiceCollection AddEventServices(this IServiceCollection services)
        {
            services.AddTransient<IEventInfoRetrievalService, EventInfoRetrievalService>();
            services.AddTransient<IEventManagementService, EventManagementService>();
            return services;
        }
    }
}
