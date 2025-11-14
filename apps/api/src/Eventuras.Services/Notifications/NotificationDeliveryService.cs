using System;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.BackgroundJobs;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.Notifications;

internal class NotificationDeliveryService : INotificationDeliveryService
{
    private readonly ILogger<NotificationDeliveryService> _logger;
    private readonly INotificationAccessControlService _notificationAccessControlService;
    private readonly INotificationManagementService _notificationManagementService;
    private readonly IBackgroundJobQueue _jobQueue;

    public NotificationDeliveryService(
        ILogger<NotificationDeliveryService> logger,
        INotificationAccessControlService notificationAccessControlService,
        INotificationManagementService notificationManagementService,
        IBackgroundJobQueue jobQueue)
    {
        _logger = logger ?? throw
            new ArgumentNullException(nameof(logger));

        _notificationAccessControlService = notificationAccessControlService ?? throw
            new ArgumentNullException(nameof(notificationAccessControlService));

        _notificationManagementService = notificationManagementService ?? throw
            new ArgumentNullException(nameof(notificationManagementService));

        _jobQueue = jobQueue ?? throw
            new ArgumentNullException(nameof(jobQueue));
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

            await _jobQueue.QueueNotificationJobAsync(
                recipient.RecipientId,
                accessControlDone: true,
                cancellationToken);
        }
    }
}
