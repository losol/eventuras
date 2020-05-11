using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Losol.Communication.Email
{
    public abstract class AbstractEmailSender : IEmailSender
    {
        public Task SendEmailAsync(
            string address,
            string subject,
            string message,
            Attachment attachment = null,
            EmailMessageType messageType = EmailMessageType.Html)
        {
            if (string.IsNullOrEmpty(address))
            {
                throw new ArgumentException(nameof(address));
            }
            if (string.IsNullOrEmpty(subject))
            {
                throw new ArgumentException(nameof(subject));
            }
            if (string.IsNullOrEmpty(message))
            {
                throw new ArgumentException(nameof(message));
            }
            return SendEmailAsync(new EmailModel
            {
                Recipients = new[] { new Address(address) },
                Subject = subject,
                TextBody = messageType == EmailMessageType.Text ? message : null,
                HtmlBody = messageType == EmailMessageType.Html ? message : null,
                Attachments = attachment != null
                    ? new List<Attachment> { attachment }
                    : new List<Attachment>()
            });
        }

        public abstract Task SendEmailAsync(EmailModel emailModel);
    }
}
