using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Losol.Communication.Email;
using Losol.Communication.Sms;
using Markdig;
using Microsoft.Extensions.Logging;
using NodaTime;

namespace Eventuras.Services.Notifications;

internal class NotificationDeliveryService : INotificationDeliveryService
{
    private readonly IEmailSender _emailSender;
    private readonly ISmsSender _smsSender;
    private readonly ILogger<NotificationDeliveryService> _logger;
    private readonly INotificationManagementService _notificationManagementService;
    private readonly INotificationStatisticsService _notificationStatisticsService;

    public NotificationDeliveryService(
        IEmailSender emailSender,
        ISmsSender smsSender,
        ILogger<NotificationDeliveryService> logger,
        INotificationManagementService notificationManagementService,
        INotificationStatisticsService notificationStatisticsService)
    {
        _emailSender = emailSender ?? throw new ArgumentNullException(nameof(emailSender));

        _smsSender = smsSender ?? throw new ArgumentNullException(nameof(smsSender));

        _logger = logger ?? throw new ArgumentNullException(nameof(logger));

        _notificationManagementService = notificationManagementService ?? throw new ArgumentNullException(nameof(notificationManagementService));

        _notificationStatisticsService = notificationStatisticsService ?? throw new ArgumentNullException(nameof(notificationStatisticsService));
    }

    public async Task SendNotificationAsync(Notification notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Sending {Type} notification #{Id} to {TotalRecipients} recipients",
            notification.Type,
            notification.NotificationId,
            notification.Recipients.Count);

        // TODO: use some queue for this? As it's not very critical I'm leaving the naive implementation for now...

        notification.Status = NotificationStatus.Started;
        await _notificationManagementService.UpdateNotificationAsync(notification);

        var message = notification.Type == NotificationType.Email ? Markdown.ToHtml(notification.Message) : notification.Message;

        var delivered = 0;
        var status = NotificationStatus.Sent;
        await Task.WhenAll(notification.Recipients.Select(async recipient =>
        {
            if (cancellationToken.IsCancellationRequested)
            {
                status = NotificationStatus.Cancelled;
                return;
            }

            try
            {
                await SendToRecipientAsync(notification, recipient, message);

                recipient.Sent = SystemClock.Instance.Now();

                await _notificationManagementService.UpdateNotificationRecipientAsync(recipient);

                ++delivered;
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Failed to send email notification to {Address}", recipient.RecipientIdentifier);

                recipient.Errors = e.Message;
                status = NotificationStatus.Failed;

                await _notificationManagementService.UpdateNotificationRecipientAsync(recipient);
            }
        }));

        notification.Status = status;
        await _notificationManagementService.UpdateNotificationAsync(notification);
        await _notificationStatisticsService.UpdateNotificationStatisticsAsync(notification);

        _logger.LogInformation("Notification {Id} {Status}; delivered to {Delivered} of {Total} recipients",
            notification.NotificationId,
            status,
            delivered,
            notification.Recipients.Count);
    }

    private async Task SendToRecipientAsync(Notification notification, NotificationRecipient recipient, string message)
    {
        if (notification is EmailNotification email)
            await _emailSender.SendEmailAsync(new EmailModel
            {
                Recipients = new[]
                {
                    new Address(recipient.RecipientName, recipient.RecipientIdentifier),
                },
                Subject = email.Subject,
                HtmlBody = message,
            });

        if (notification is SmsNotification) await _smsSender.SendSmsAsync(recipient.RecipientIdentifier, message);
    }
}