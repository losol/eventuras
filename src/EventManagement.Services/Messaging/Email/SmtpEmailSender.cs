using System;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using MimeKit.Text;

namespace losol.EventManagement.Services.Messaging
{
    public class SmtpEmailSender : IEmailSender
    {
        private readonly SmtpOptions options;
        private readonly ILogger _logger;
        public SmtpEmailSender(IOptions<SmtpOptions> options, ILogger<SmtpEmailSender> logger)
        {
            this.options = options.Value;
            _logger = logger;
        }

        public Task SendEmailAsync(string email, string subject, string message) =>
            SendEmailAsync(email, subject, message, attachment: null);

        public Task SendEmailAsync(string email, string subject, string message, Attachment attachment)
        {
            MimeMessage mailmessage = new MimeMessage();

            mailmessage.To.Add(new MailboxAddress(email));
            mailmessage.From.Add(new MailboxAddress(options.From));

            mailmessage.Subject = subject;

            var builder = new BodyBuilder ();

            builder.HtmlBody = message;

            if (attachment != null) {
                builder.Attachments.Add(attachment.Filename, new MemoryStream(attachment.Bytes));
            }

            mailmessage.Body = builder.ToMessageBody();

            var emailresult = "";

            using (var emailClient = new SmtpClient()) {

                try {
                    _logger.LogInformation($"*** START SEND EMAIL BY SMTP - Smtp host: {options.Host} - Port: {options.Port}***");

                    emailClient.Connect(options.Host, options.Port, SecureSocketOptions.StartTls);
                    emailClient.Authenticate(options.Username, options.Password);
                    emailClient.Send(mailmessage);
                    emailClient.Disconnect(true);

                    _logger.LogInformation("*** END SEND EMAIL ***");
                } catch (Exception ex) {
                    _logger.LogError(ex.Message);
                    emailresult = ex.Message;
                }
	
            }

            return Task.FromResult(0);

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
