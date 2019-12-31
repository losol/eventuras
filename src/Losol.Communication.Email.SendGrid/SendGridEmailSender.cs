using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using System;
using System.Net.Mail;
using System.Threading.Tasks;

namespace Losol.Communication.Email.SendGrid
{
    public class SendGridEmailSender : IEmailSender
    {
        private readonly SendGridConfig _config;

        public SendGridEmailSender(IOptions<SendGridConfig> options)
        {
            _config = options.Value;
        }

        public async Task SendEmailAsync(
            string address,
            string subject,
            string message,
            Attachment attachment = null,
            EmailMessageType messageType = EmailMessageType.Html)
        {
            var client = new SendGridClient(_config.Key);
            var msg = new SendGridMessage
            {
                From = new EmailAddress(_config.EmailAddress, _config.Name),
                Subject = subject
            };
            switch (messageType)
            {
                case EmailMessageType.Html:
                    msg.HtmlContent = message;
                    msg.PlainTextContent = message; // TODO: convert html to plain text!
                    break;
                case EmailMessageType.Text:
                    msg.PlainTextContent = message;
                    break;
            }
            var mailAddress = new MailAddress(address);
            msg.AddTo(new EmailAddress(mailAddress.Address, mailAddress.DisplayName));
            if (attachment != null)
            {
                msg.AddAttachment(attachment.Filename, Convert.ToBase64String(attachment.Bytes));
            }
            await client.SendEmailAsync(msg);
        }
    }
}
