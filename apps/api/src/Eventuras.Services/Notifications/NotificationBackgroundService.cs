using System;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Exceptions;
using Hangfire;
using Losol.Communication.Email;
using Losol.Communication.Sms;
using Markdig;
using Microsoft.Extensions.Logging;
using NodaTime;

namespace Eventuras.Services.Notifications;

public class NotificationBackgroundService : INotificationBackgroundService
{
    private readonly IEmailSender _emailSender;
    private readonly ILogger<NotificationBackgroundService> _logger;
    private readonly INotificationManagementService _notificationManagementService;
    private readonly INotificationRecipientRetrievalService _notificationRecipientRetrievalService;
    private readonly INotificationRetrievalService _notificationRetrievalService;
    private readonly ISmsSender _smsSender;

    public NotificationBackgroundService(
        IEmailSender emailSender,
        ISmsSender smsSender,
        INotificationManagementService notificationManagementService,
        INotificationRetrievalService notificationRetrievalService,
        INotificationRecipientRetrievalService notificationRecipientRetrievalService,
        ILogger<NotificationBackgroundService> logger)
    {
        _emailSender = emailSender;
        _smsSender = smsSender;
        _notificationManagementService = notificationManagementService;
        _notificationRetrievalService = notificationRetrievalService;

        _notificationRecipientRetrievalService = notificationRecipientRetrievalService;
        _logger = logger;
    }

    [AutomaticRetry(Attempts = 0)]
    public async Task SendNotificationToRecipientAsync(int recipientId, bool accessControlDone = false)
    {
        var recipient =
            await _notificationRecipientRetrievalService.GetNotificationRecipientByIdAsync(recipientId, true);
        var notification =
            await _notificationRetrievalService.GetNotificationByIdAsync(recipient.NotificationId,
                accessControlDone: accessControlDone);

        if (notification.OrganizationId == null)
        {
            throw new NotFoundException(nameof(notification.OrganizationId));
        }

        if (recipient == null)
        {
            return;
        }

        var message = notification.Type == NotificationType.Email
            ? Markdown.ToHtml(notification.Message)
            : notification.Message;

        try
        {
            if (notification is EmailNotification email)
            {
                await _emailSender.SendEmailAsync(new EmailModel
                {
                    Recipients = new[]
                        {
                            new Address(
                                recipient.RecipientName,
                                recipient.RecipientIdentifier)
                        },
                    Subject = email.Subject,
                    HtmlBody = message
                }
                    , new EmailOptions { OrganizationId = email.OrganizationId });

                recipient.Sent = SystemClock.Instance.GetCurrentInstant();
                await _notificationManagementService.UpdateNotificationRecipientAsync(recipient);
            }
            else if (notification.Type == NotificationType.Sms)
            {
                await _smsSender.SendSmsAsync(recipient.RecipientIdentifier, message,
                    notification.OrganizationId.Value);
                recipient.Sent = SystemClock.Instance.GetCurrentInstant();
                await _notificationManagementService.UpdateNotificationRecipientAsync(recipient);
            }
        }
        catch (Exception e)
        {
            // Save the error to the notification recipient
            recipient.Errors = e.Message;
            await _notificationManagementService.UpdateNotificationRecipientAsync(recipient);

            _logger.LogError(e, "Error sending notification: {ExceptionMessage}", e.Message);
            throw;
        }
    }
}
