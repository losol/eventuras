using Eventuras.Services.Invoicing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.Stripe;

public static class StripeServiceCollectionExtensions
{
    public static IServiceCollection AddStripe(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<StripeOptions>().ValidateDataAnnotations().Bind(configuration);

        services.AddSingleton<IInvoicingProvider, StripeInvoicingService>(); // should be initialized only once

        return services;
    }
}