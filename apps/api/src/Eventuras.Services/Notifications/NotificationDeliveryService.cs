using System;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Notifications;
using Microsoft.Extensions.Logging;

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

    public async Task QueueNotificationAsync(
        Notification notification,
        bool accessControlDone = false,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Queueing {Type} notification #{Id} to {TotalRecipients} recipients",
            notification.Type, notification.NotificationId,
            notification.Recipients.Count);

        if (!accessControlDone)
        {
            await _notificationAccessControlService.CheckNotificationUpdateAccessAsync(notification, cancellationToken);
        }

        notification.Status = NotificationStatus.Queued;
        await _notificationManagementService.UpdateNotificationAsync(notification);
    }
}
