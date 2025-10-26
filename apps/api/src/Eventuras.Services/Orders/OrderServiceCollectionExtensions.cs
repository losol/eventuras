using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.Orders;

internal static class OrderServiceCollectionExtensions
{
    public static void AddOrderServices(this IServiceCollection services)
    {
        services.AddTransient<IOrderRetrievalService, OrderRetrievalService>();
        services.AddScoped<IOrderManagementService, OrderManagementService>();
        services.AddTransient<IOrderAccessControlService, OrderAccessControlService>();
    }
}
