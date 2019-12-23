using losol.EventManagement.Services.Pdf;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace EventManagement.Services.Converto
{
    public static class ConvertoServicesExtensions
    {
        public static IServiceCollection AddConvertoServices(this IServiceCollection services, IConfiguration config)
        {
            services.Configure<ConvertoConfig>(config);
            services.TryAddTransient<IPdfRenderService, ConvertoPdfRenderService>();
            return services;
        }
    }
}
