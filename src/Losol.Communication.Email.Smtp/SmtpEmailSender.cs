using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Losol.Communication.Email.Smtp
{
    public class SmtpEmailSender : IEmailSender
    {
        private readonly SmtpConfig _smtpConfig;
        private readonly ILogger _logger;

        public SmtpEmailSender(IOptions<SmtpConfig> smtpConfig, ILogger<SmtpEmailSender> logger)
        {
            _smtpConfig = smtpConfig.Value;
            _logger = logger;
        }

        public Task SendEmailAsync(
            string address,
            string subject,
            string message,
            Attachment attachment = null,
            EmailMessageType messageType = EmailMessageType.Html)
        {
            var mimeMessage = new MimeMessage();

            mimeMessage.To.Add(MailboxAddress.Parse(address));
            mimeMessage.From.Add(MailboxAddress.Parse(_smtpConfig.From));

            mimeMessage.Subject = subject;

            var bodyBuilder = new BodyBuilder();

            switch (messageType)
            {
                case EmailMessageType.Text:
                    bodyBuilder.TextBody = message;
                    break;

                case EmailMessageType.Html:
                    bodyBuilder.HtmlBody = message;
                    break;
            }

            if (attachment != null)
            {
                bodyBuilder.Attachments.Add(attachment.Filename, new MemoryStream(attachment.Bytes));
            }

            mimeMessage.Body = bodyBuilder.ToMessageBody();

            using var emailClient = new SmtpClient();

            try
            {
                _logger.LogInformation($"*** START SEND EMAIL BY SMTP - Smtp host: {_smtpConfig.Host} - Port: {_smtpConfig.Port}***");

                emailClient.Connect(_smtpConfig.Host, _smtpConfig.Port, SecureSocketOptions.StartTls);
                if (!string.IsNullOrEmpty(_smtpConfig.Username) &&
                    !string.IsNullOrEmpty(_smtpConfig.Password))
                {
                    emailClient.Authenticate(_smtpConfig.Username, _smtpConfig.Password);
                }
                emailClient.Send(mimeMessage);
                emailClient.Disconnect(true);

                _logger.LogInformation("*** END SEND EMAIL ***");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
            }

            return Task.CompletedTask;
        }
    }
}
