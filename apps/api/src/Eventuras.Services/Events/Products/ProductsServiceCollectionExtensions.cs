using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.Events.Products;

internal static class ProductsServiceCollectionExtensions
{
    public static IServiceCollection AddEventProductServices(this IServiceCollection services)
    {
        services.AddTransient<IProductRetrievalService, ProductRetrievalService>();
        return services;
    }
}
