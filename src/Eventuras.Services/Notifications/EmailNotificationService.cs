using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Losol.Communication.Email;
using Markdig;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.Notifications
{
    internal class EmailNotificationService : IEmailNotificationService
    {
        private readonly IEmailSender _emailSender;
        private readonly ILogger<EmailNotificationService> _logger;
        private readonly INotificationManagementService _notificationManagementService;

        public EmailNotificationService(
            IEmailSender emailSender,
            ILogger<EmailNotificationService> logger,
            INotificationManagementService notificationManagementService)
        {
            _emailSender = emailSender ?? throw
                new ArgumentNullException(nameof(emailSender));

            _logger = logger ?? throw
                new ArgumentNullException(nameof(logger));

            _notificationManagementService = notificationManagementService ?? throw
                new ArgumentNullException(nameof(notificationManagementService));
        }

        public async Task SendEmailNotificationAsync(
            EmailNotification notification,
            CancellationToken cancellationToken)
        {
            _logger.LogInformation("Sending email with subject {Subject} to {TotalRecipients} recipients",
                notification.Subject, notification.Recipients.Count);

            // TODO: use some queue for this? As it's not very critical I'm leaving the naive implementation for now...

            notification.Status = NotificationStatus.Started;
            await _notificationManagementService.UpdateNotificationAsync(notification);

            var delivered = new List<NotificationRecipient>();
            var htmlBody = Markdown.ToHtml(notification.Message);
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
                    await _emailSender.SendEmailAsync(new EmailModel
                    {
                        Recipients = new[]
                        {
                            new Address(
                                recipient.RecipientName,
                                recipient.RecipientIdentifier)
                        },
                        Subject = notification.Subject,
                        HtmlBody = htmlBody
                    });

                    recipient.Sent = DateTime.Now;

                    await _notificationManagementService
                        .UpdateNotificationRecipientAsync(recipient);

                    delivered.Add(recipient);
                }
                catch (Exception e)
                {
                    _logger.LogError(e,
                        "Failed to send email notification to {Address}",
                        recipient.RecipientIdentifier);

                    recipient.Errors = e.Message;
                    status = NotificationStatus.Failed;

                    await _notificationManagementService
                        .UpdateNotificationRecipientAsync(recipient);
                }
            }));

            notification.Status = status;
            await _notificationManagementService.UpdateNotificationAsync(notification);

            _logger.LogInformation("Notification {Id} {Status}; delivered to {Delivered} of {Total} recipients",
                notification.NotificationId,
                status,
                delivered.Count,
                notification.Recipients.Count);
        }
    }
}
