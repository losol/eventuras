using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Losol.Communication.Email.Mock;

public static class MockEmailServicesExtensions
{
    public static IServiceCollection AddMockEmailServices(this IServiceCollection services)
    {
        services.TryAddTransient<IEmailSender, MockEmailSender>();
        return services;
    }
}
