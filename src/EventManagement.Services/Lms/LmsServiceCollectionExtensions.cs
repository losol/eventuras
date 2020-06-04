using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace losol.EventManagement.Services.Lms
{
    internal static class LmsServiceCollectionExtensions
    {
        public static IServiceCollection AddLmsServices(this IServiceCollection services)
        {
            services.TryAddTransient<ILmsProviderService, DefaultLmsProviderService>();
            services.AddTransient<IEventSynchronizationService, EventSynchronizationService>();
            return services;
        }
    }
}
