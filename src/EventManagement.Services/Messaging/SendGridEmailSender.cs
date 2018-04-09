using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;


namespace losol.EventManagement.Services.Messaging
{
    // This class is used by the application to send email for account confirmation and password reset.
    // For more details see https://go.microsoft.com/fwlink/?LinkID=532713
    public class SendGridEmailSender : IEmailSender
    {
        public SendGridEmailSender(IOptions<SendGridOptions> optionsAccessor)
        {
            Options = optionsAccessor.Value;
        }

        public SendGridOptions Options { get; }
    

        public Task SendEmailAsync(string email, string subject, string message, Attachment attachment)
        {
            var client = new SendGridClient(Options.Key);
            var msg = new SendGridMessage()
            {
				From = new EmailAddress(email: Options.EmailAddress, name: Options.Name),
                Subject = subject,
                PlainTextContent = message,
                HtmlContent = message
            };
            msg.AddTo(new EmailAddress(email));
            if(attachment != null) 
            {
                msg.AddAttachment(attachment.Filename, Convert.ToBase64String(attachment.Bytes));
            }
            return client.SendEmailAsync(msg);
        }

        public Task SendEmailAsync(string email, string subject, string message) =>
            SendEmailAsync(email, subject, message, null);
    }
}
