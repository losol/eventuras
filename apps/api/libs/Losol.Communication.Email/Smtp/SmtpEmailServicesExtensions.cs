using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Losol.Communication.Email.Smtp;

public static class SmtpEmailServicesExtensions
{
    public static IServiceCollection AddSmtpEmailServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddOptions<SmtpConfig>()
            .ValidateDataAnnotations()
            .Bind(configuration);
        services.TryAddTransient<IEmailSender, SmtpEmailSender>();
        return services;
    }
}
