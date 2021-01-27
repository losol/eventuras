using Losol.Communication.Email;
using Markdig;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.Notifications
{
    internal class EmailNotificationService : IEmailNotificationService
    {
        private readonly IEmailSender _emailSender;
        private readonly ILogger<EmailNotificationService> _logger;

        public EmailNotificationService(IEmailSender emailSender,
            ILogger<EmailNotificationService> logger)
        {
            _emailSender = emailSender ?? throw
                new ArgumentNullException(nameof(emailSender));

            _logger = logger ?? throw
                new ArgumentNullException(nameof(logger));
        }

        public async Task SendEmailToRecipientsAsync(
            EmailNotification notification,
            string[] recipientAddresses,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Sending email with subject {subject} to {totalRecipients} recipients",
                notification.Subject, recipientAddresses.Length);

            // TODO: use some queue for this? As it's not very critical I'm leaving the naive implementation for now...

            var htmlBody = Markdown.ToHtml(notification.BodyMarkdown);
            await Task.WhenAll(recipientAddresses.Select(async address =>
            {
                try
                {
                    await _emailSender.SendEmailAsync(new EmailModel
                    {
                        Recipients = new[] { new Address(address) },
                        Subject = notification.Subject,
                        HtmlBody = htmlBody
                    });
                }
                catch (Exception e)
                {
                    _logger.LogError(e, "Failed to send email notification to {address}", address);
                }
            }));
        }
    }
}
