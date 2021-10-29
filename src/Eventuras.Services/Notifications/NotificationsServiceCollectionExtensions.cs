using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.Notifications
{
    internal static class NotificationsServiceCollectionExtensions
    {
        public static IServiceCollection AddNotificationServices(this IServiceCollection services)
        {
            services.AddTransient<IEmailNotificationService, EmailNotificationService>();
            services.AddTransient<INotificationManagementService, NotificationManagementService>();
            services.AddTransient<INotificationRetrievalService, NotificationRetrievalService>();
            services.AddTransient<INotificationAccessControlService, NotificationAccessControlService>();
            services.AddTransient<INotificationStatisticsService, NotificationStatisticsService>();
            return services;
        }
    }
}
