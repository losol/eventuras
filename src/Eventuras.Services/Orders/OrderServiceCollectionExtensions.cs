using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.Orders
{
    internal static class OrderServiceCollectionExtensions
    {
        public static void AddOrderServices(this IServiceCollection services)
        {
            services.AddScoped<IOrderService, OrderService>();
            services.AddTransient<IOrderVmConversionService, OrderVmConversionService>();
            services.AddTransient<IOrderRetrievalService, OrderRetrievalService>();
        }
    }
}
