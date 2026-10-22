using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.Privacy;

public static class PrivacyServiceCollectionExtensions
{
    public static IServiceCollection AddPrivacyServices(this IServiceCollection services)
    {
        services.AddScoped<IProcessingPurposeService, ProcessingPurposeService>();
        return services;
    }
}
