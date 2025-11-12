using System;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Hangfire;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.Notifications;

internal class NotificationDeliveryService : INotificationDeliveryService
{
    private readonly ILogger<NotificationDeliveryService> _logger;
    private readonly INotificationAccessControlService _notificationAccessControlService;
    private readonly INotificationManagementService _notificationManagementService;

    public NotificationDeliveryService(
        ILogger<NotificationDeliveryService> logger,
        INotificationAccessControlService notificationAccessControlService,
        INotificationManagementService notificationManagementService)
    {
        _logger = logger ?? throw
            new ArgumentNullException(nameof(logger));

        _notificationAccessControlService = notificationAccessControlService ?? throw
            new ArgumentNullException(nameof(notificationAccessControlService));

        _notificationManagementService = notificationManagementService ?? throw
            new ArgumentNullException(nameof(notificationManagementService));
    }

    public async Task SendNotificationAsync(
        Notification notification,
        bool accessControlDone = false,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Queueing {Type} notification #{Id} to {TotalRecipients} recipients",
            notification.Type, notification.NotificationId,
            notification.Recipients.Count);


        notification.Status = NotificationStatus.Started;
        await _notificationManagementService.UpdateNotificationAsync(notification);

        if (!accessControlDone)
        {
            await _notificationAccessControlService.CheckNotificationUpdateAccessAsync(notification, cancellationToken);
        }

        foreach (var recipient in notification.Recipients)
        {
            if (cancellationToken.IsCancellationRequested)
            {
                notification.Status = NotificationStatus.Cancelled;
                await _notificationManagementService.UpdateNotificationAsync(notification);
                return;
            }

            BackgroundJob.Enqueue<NotificationBackgroundService>("notifications_queue",
                x => x.SendNotificationToRecipientAsync(recipient.RecipientId, true));
        }
    }
}
