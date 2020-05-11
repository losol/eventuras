using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Losol.Communication.Email.SendGrid
{
    public class SendGridEmailSender : AbstractEmailSender
    {
        private readonly SendGridConfig _config;

        public SendGridEmailSender(IOptions<SendGridConfig> options)
        {
            _config = options.Value;
        }

        public override async Task SendEmailAsync(EmailModel emailModel)
        {
            var msg = new SendGridMessage
            {
                From = emailModel.From != null
                ? new EmailAddress(emailModel.From.Email, emailModel.From.Name)
                : new EmailAddress(_config.EmailAddress, _config.Name),
                Subject = emailModel.Subject,
                HtmlContent = emailModel.HtmlBody,
                PlainTextContent = emailModel.TextBody // TODO: convert html to plain text?
            };

            msg.AddTos(emailModel.Recipients.Select(a => new EmailAddress(a.Email, a.Name)).ToList());

            if (emailModel.Cc?.Any() == true)
            {
                msg.AddCcs(emailModel.Cc.Select(a => new EmailAddress(a.Email, a.Name)).ToList());
            }

            if (emailModel.Bcc?.Any() == true)
            {
                msg.AddBccs(emailModel.Bcc.Select(a => new EmailAddress(a.Email, a.Name)).ToList());
            }

            if (emailModel.Attachments?.Any() == true)
            {
                msg.AddAttachments(emailModel.Attachments.Select(a => new global::SendGrid.Helpers.Mail.Attachment
                {
                    Filename = a.Filename,
                    Content = Convert.ToBase64String(a.Bytes),
                    Type = a.ContentType,
                    Disposition = a.ContentDisposition,
                    ContentId = a.ContentId
                }));
            }

            var client = new SendGridClient(_config.Key);
            await client.SendEmailAsync(msg);
        }
    }
}
