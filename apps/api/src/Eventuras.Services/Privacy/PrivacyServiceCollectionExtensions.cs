using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.Privacy;

public static class PrivacyServiceCollectionExtensions
{
    public static IServiceCollection AddPrivacyServices(this IServiceCollection services)
    {
        services.AddScoped<IProcessingPurposeService, ProcessingPurposeService>();
        services.AddScoped<IPurposeDecisionService, PurposeDecisionService>();
        return services;
    }
}
