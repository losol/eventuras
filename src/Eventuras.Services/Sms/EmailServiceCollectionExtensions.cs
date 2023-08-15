using Losol.Communication.Sms;
using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.Sms;

public static class SmsServiceCollectionExtensions
{
    public static IServiceCollection AddConfigurableSmsServices(this IServiceCollection services)
    {
        services.AddTransient<ISmsSender, ConfigurableSmsSender>();
        return services;
    }
}