using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Losol.Communication.Sms.Mock;

public static class MockSmsServicesExtensions
{
    public static IServiceCollection AddMockSmsServices(this IServiceCollection services)
    {
        services.TryAddTransient<ISmsSender, MockSmsSender>();
        return services;
    }
}
