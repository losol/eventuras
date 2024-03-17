using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Losol.Communication.Email.SendGrid;

public static class SendGridEmailServicesExtensions
{
    public static IServiceCollection AddSendGridEmailServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddOptions<SendGridConfig>()
            .ValidateDataAnnotations()
            .Bind(configuration);
        services.TryAddTransient<IEmailSender, SendGridEmailSender>();
        return services;
    }
}
