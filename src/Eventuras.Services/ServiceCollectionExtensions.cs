using Eventuras.Services.Auth;
using Eventuras.Services.EventCollections;
using Eventuras.Services.Events;
using Eventuras.Services.Invoicing;
using Eventuras.Services.ExternalSync;
using Eventuras.Services.Notifications;
using Eventuras.Services.Orders;
using Eventuras.Services.Organizations;
using Eventuras.Services.Registrations;
using Eventuras.Services.Users;
using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddCoreServices(this IServiceCollection services)
        {
            services.AddScoped<IPaymentMethodService, PaymentMethodService>();
            services.AddScoped<IRegistrationService, RegistrationService>();
            services.AddScoped<IProductsService, ProductsService>();
            services.AddScoped<ICertificatesService, CertificatesService>();
            services.AddScoped<IMessageLogService, MessageLogService>();
            services.AddRegistrationServices();
            services.AddNotificationServices();
            services.AddOrganizationServices();
            services.AddUserServices();
            services.AddAuthServices();
            services.AddEventServices();
            services.AddEventCollectionServices();
            services.AddOrderServices();
            services.AddInvoicingServices();
            services.AddExternalSyncServices();
            return services;
        }
    }
}
