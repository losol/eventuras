using Losol.Communication.Email;
using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.Email;

public static class EmailServiceCollectionExtensions
{
    public static IServiceCollection AddConfigurableEmailServices(this IServiceCollection services)
    {
        services.AddTransient<IEmailSender, ConfigurableEmailSender>();
        services.AddTransient<IApplicationEmailSender, ApplicationEmailSender>();
        return services;
    }
}
