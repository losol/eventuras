using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.Notifications
{
    internal static class NotificationsServiceCollectionExtensions
    {
        public static IServiceCollection AddNotificationServices(this IServiceCollection services)
        {
            services.AddTransient<IEmailNotificationService, EmailNotificationService>();
            services.AddTransient<INotificationManagementService, NotificationManagementService>();
            return services;
        }
    }
}
