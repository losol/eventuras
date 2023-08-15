using Eventuras.Services.Email;
using Eventuras.Services.Organizations.Settings;
using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.Smtp;

public static class SmtpServiceCollectionExtensions
{
    public static IServiceCollection AddConfigurableSmtpServices(this IServiceCollection services)
    {
        services.AddTransient<IOrganizationSettingsRegistryComponent, SmtpSettingsRegistryComponent>();

        services.AddTransient<IConfigurableEmailSenderComponent, SmtpEmailSenderComponent>();

        return services;
    }
}