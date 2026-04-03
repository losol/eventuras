using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.BusinessEvents;

public static class BusinessEventServiceCollectionExtensions
{
    public static IServiceCollection AddBusinessEventServices(this IServiceCollection services)
    {
        services.AddScoped<IBusinessEventService, BusinessEventService>();
        return services;
    }
}
