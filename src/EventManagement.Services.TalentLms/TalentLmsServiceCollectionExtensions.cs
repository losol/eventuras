using losol.EventManagement.Services.Lms;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace EventManagement.Services.TalentLms
{
    public static class TalentLmsServiceCollectionExtensions
    {
        public static IServiceCollection AddTalentLmsIfEnabled(
            this IServiceCollection services,
            IConfigurationSection configuration)
        {
            if (configuration?.GetValue<bool>("Enabled") != true)
            {
                return services;
            }

            services.AddTransient<ITalentLmsApiService, TalentLmsApiService>();
            services.AddTransient<ILmsProviderService, TalentLmsProviderService>();
            services.AddOptions<TalentLmsSettings>()
                .ValidateDataAnnotations()
                .Bind(configuration);

            return services;
        }
    }
}
