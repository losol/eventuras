using System;
using System.Threading.Tasks;
using Eventuras.Domain;
using Microsoft.Extensions.Logging;
using Quartz;

namespace Eventuras.Services.Notifications;

[DisallowConcurrentExecution]
public class NotificationJob : IJob
{
    private readonly ILogger<NotificationJob> _logger;
    private readonly INotificationManagementService _notificationManagementService;
    private readonly INotificationRetrievalService _notificationRetrievalService;
    private readonly INotificationBackgroundService _notificationBackgroundService;

    public NotificationJob(ILogger<NotificationJob> logger,
        INotificationManagementService notificationManagementService,
        INotificationRetrievalService notificationRetrievalService,
        INotificationBackgroundService notificationBackgroundService)
    {
        _logger = logger;
        _notificationManagementService = notificationManagementService;
        _notificationRetrievalService = notificationRetrievalService;
        _notificationBackgroundService = notificationBackgroundService;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        _logger.LogInformation("Executing Notification Job");

        var statuses = new[] { NotificationStatus.Queued, NotificationStatus.Started };

        var retrievalOptions = new NotificationRetrievalOptions
        {
            LoadRecipients = true,
            LoadStatistics = true
        };

        var queuedNotifications = await _notificationRetrievalService.GetNotificationsByStatusAsync(
            statuses,
            options: retrievalOptions,
            accessControlDone: true);

        if (queuedNotifications.Count == 0)
        {
            _logger.LogInformation("No Notifications found for Queued or Started status");
            return;
        }

        foreach (var notification in queuedNotifications)
        {
            await ProcessNotification(notification);
        }
    }

    private async Task ProcessNotification(Notification notification)
    {
        try
        {
            notification.Status = NotificationStatus.Started;
            await _notificationManagementService.UpdateNotificationAsync(notification);

            if (notification.Recipients != null)
            {
                await SendNotificationAsync(notification);
                notification.Status = NotificationStatus.Sent;
            }
            else
            {
                _logger.LogInformation("Notification #{NotificationId} has no recipients", notification.NotificationId);
                notification.Status = NotificationStatus.Failed;
            }

            await _notificationManagementService.UpdateNotificationAsync(notification);
            _logger.LogInformation("Notification #{NotificationId} sent successfully", notification.NotificationId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send Notification #{NotificationId}", notification.NotificationId);
            notification.Status = NotificationStatus.Failed;
            await _notificationManagementService.UpdateNotificationAsync(notification);
        }

        await _notificationManagementService.UpdateNotificationAsync(notification);
    }

    private async Task SendNotificationAsync(Notification notification)
    {
        foreach (var recipient in notification.Recipients)
        {
            await _notificationBackgroundService.SendNotificationToRecipientAsync(recipient.RecipientId, true);
        }
    }
}
