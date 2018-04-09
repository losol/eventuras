using System;
using System.IO;
using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;

namespace losol.EventManagement.Services.Messaging
{
    public class SmtpEmailSender : IEmailSender
    {
        private readonly SmtpOptions options;
        public SmtpEmailSender(IOptions<SmtpOptions> options)
        {
            this.options = options.Value;
        }

        public Task SendEmailAsync(string email, string subject, string message) =>
            SendEmailAsync(email, subject, message, attachment: null);

        public Task SendEmailAsync(string email, string subject, string message, Attachment attachment)
        {
            MailMessage mailMsg = new MailMessage();

            mailMsg.To.Add(new MailAddress(email));
            mailMsg.From = new MailAddress(options.From);

            mailMsg.Subject = subject;
            mailMsg.Body = message;
            string html = message;
            mailMsg.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(html, null, MediaTypeNames.Text.Html));

            if(attachment != null) 
            {
                mailMsg.Attachments.Add(new System.Net.Mail.Attachment(new MemoryStream(attachment.Bytes), attachment.Filename));
            }

            SmtpClient smtpClient = new SmtpClient(options.Host, options.Port);
            System.Net.NetworkCredential credentials = new System.Net.NetworkCredential(options.Username, options.Password);
            smtpClient.Credentials = credentials;

            return smtpClient.SendMailAsync(mailMsg);
        }
    }

    public class SmtpOptions
    {
        public string Host { get; set; }
        public int Port { get; set; }
        public string From { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
