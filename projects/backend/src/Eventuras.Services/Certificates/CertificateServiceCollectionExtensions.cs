using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.Certificates
{
    public static class CertificateServiceCollectionExtensions
    {
        public static IServiceCollection AddCertificateServices(this IServiceCollection services)
        {
            services.AddTransient<ICertificateAccessControlService, CertificateAccessControlService>();
            services.AddTransient<ICertificateIssuingService, CertificateIssuingService>();
            services.AddTransient<ICertificateRetrievalService, CertificateRetrievalService>();
            services.AddTransient<ICertificateRenderer, CertificateRenderer>();
            services.AddTransient<ICertificateDeliveryService, CertificateDeliveryService>();
            return services;
        }
    }
}
