using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.Invoicing;

internal static class InvoicingServiceCollectionExtensions
{
    public static void AddInvoicingServices(this IServiceCollection services) =>
        services.AddTransient<IInvoicingService, InvoicingService>();
}
