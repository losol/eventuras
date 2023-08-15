using Eventuras.Services.Email;
using Eventuras.Services.Organizations.Settings;
using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.SendGrid;

public static class SendGridServiceCollectionExtensions
{
    public static IServiceCollection AddConfigurableSendGridServices(this IServiceCollection services)
    {
        services.AddTransient<IOrganizationSettingsRegistryComponent, SendGridSettingsRegistryComponent>();

        services.AddTransient<IConfigurableEmailSenderComponent, SendGridEmailSenderComponent>();

        return services;
    }
}