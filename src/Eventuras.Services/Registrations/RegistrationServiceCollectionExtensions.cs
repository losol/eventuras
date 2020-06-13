using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.Registrations
{
    internal static class LmsServiceCollectionExtensions
    {
        public static IServiceCollection AddRegistrationServices(this IServiceCollection services)
        {
            services.AddTransient<IRegistrationRetrievalService, RegistrationRetrievalService>();
            services.AddTransient<IRegistrationExportService, RegistrationExportService>();
            services.AddTransient<IRegistrationEnrollmentService, RegistrationEnrollmentService>();
            return services;
        }
    }
}
