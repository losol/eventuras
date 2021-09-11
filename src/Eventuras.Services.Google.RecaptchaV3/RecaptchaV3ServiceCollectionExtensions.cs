using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.Google.RecaptchaV3
{
    public static class RecaptchaV3ServiceCollectionExtensions
    {
        public static IServiceCollection AddRecaptchaV3(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services.AddOptions<RecaptchaV3Config>()
                .ValidateDataAnnotations()
                .Bind(configuration);

            services.AddScoped<IRecaptchaV3VerificationService, RecaptchaV3VerificationService>();
            return services;
        }
    }
}
