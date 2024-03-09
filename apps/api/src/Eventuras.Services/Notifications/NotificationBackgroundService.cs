using System;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Losol.Communication.Email;
using Losol.Communication.Sms;
using Markdig;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.Notifications;


public class NotificationBackgroundService
{
    private readonly IEmailSender _emailSender;
    private readonly ISmsSender _smsSender;
    private readonly INotificationManagementService _notificationManagementService;
    private readonly INotificationRetrievalService _notificationRetrievalService;
    private readonly INotificationRecipientRetrievalService _notificationRecipientRetrievalService;
    private readonly ILogger<NotificationBackgroundService> _logger;

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
    public async Task SendNotificationAsync(int notificationId, string recipientIdentifier, bool accessControlDone = false)
    {
        var notification = await _notificationRetrievalService.GetNotificationByIdAsync(notificationId, accessControlDone: accessControlDone);
        var recipient = await _notificationRecipientRetrievalService.GetNotificationRecipientByIdentifierAsync(recipientIdentifier, accessControlDone: true);

        if (recipient == null) return;

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
                , new EmailOptions
                {
                    OrganizationId = email.OrganizationId
                });

            }
            else if (notification.Type == NotificationType.Sms)
            {
                await _smsSender.SendSmsAsync(recipient.RecipientIdentifier, message);
            }

        }
        catch (Exception e)
        {
            // Save the error to the notification recipient
            recipient.Errors = e.Message;
            await _notificationManagementService.UpdateNotificationRecipientAsync(recipient);

            _logger.LogError(e, "Error sending notification");
            throw;
        }
    }
}
