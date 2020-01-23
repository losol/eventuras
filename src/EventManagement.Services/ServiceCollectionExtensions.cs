using losol.EventManagement.Services.Invoicing;
using losol.EventManagement.Services.Registrations;
using Microsoft.Extensions.DependencyInjection;

namespace losol.EventManagement.Services
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
            services.AddTransient<IRegistrationRetrievalService, RegistrationRetrievalService>();
            services.AddTransient<IRegistrationExportService, RegistrationExportService>();
            return services;
        }
    }
}
