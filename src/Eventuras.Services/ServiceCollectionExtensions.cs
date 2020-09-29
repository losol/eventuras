using Eventuras.Services.Invoicing;
using Eventuras.Services.ExternalSync;
using Eventuras.Services.Organizations;
using Eventuras.Services.Registrations;
using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddEventServices(this IServiceCollection services)
        {
            services.AddScoped<IEventInfoService, EventInfoService>();
            services.AddScoped<IPaymentMethodService, PaymentMethodService>();
            services.AddScoped<StripeInvoiceProvider>();
            services.AddScoped<IRegistrationService, RegistrationService>();
            services.AddScoped<IProductsService, ProductsService>();
            services.AddScoped<IOrderService, OrderService>();
            services.AddScoped<ICertificatesService, CertificatesService>();
            services.AddScoped<IMessageLogService, MessageLogService>();
            services.AddTransient<IOrderVmConversionService, OrderVmConversionService>();
            services.AddRegistrationServices();
            services.AddLmsServices();
            services.AddOrganizationServices();
            return services;
        }
    }
}
