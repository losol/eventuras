using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Losol.Communication.Sms.Twilio;

public static class TwilioSmsServicesExtensions
{
    public static IServiceCollection AddTwilioSmsServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddOptions<TwilioOptions>()
            .ValidateDataAnnotations()
            .Bind(configuration);
        services.TryAddTransient<ISmsSender, TwilioSmsSender>();
        return services;
    }
}
