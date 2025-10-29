using Eventuras.Services.Auth;
using Eventuras.Services.Certificates;
using Eventuras.Services.EventCollections;
using Eventuras.Services.Events;
using Eventuras.Services.ExternalSync;
using Eventuras.Services.Invoicing;
using Eventuras.Services.Notifications;
using Eventuras.Services.Orders;
using Eventuras.Services.Organizations;
using Eventuras.Services.Registrations;
using Eventuras.Services.Users;
using Eventuras.Services.Views;
using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddCoreServices(this IServiceCollection services)
    {
        services.AddScoped<IUserAccessControlService, UserAccessControlService>();
        services.AddScoped<IPaymentMethodService, PaymentMethodService>();
        services.AddScoped<IProductsService, ProductsService>();
        services.AddRegistrationServices();
        services.AddNotificationServices();
        services.AddOrganizationServices();
        services.AddCertificateServices();
        services.AddUserServices();
        services.AddAuthServices();
        services.AddEventServices();
        services.AddEventCollectionServices();
        services.AddOrderServices();
        services.AddInvoicingServices();
        services.AddExternalSyncServices();
        services.AddViewServices();
        return services;
    }
}
