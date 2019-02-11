using System;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Options;
using MimeKit;
using MimeKit.Text;

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
            MimeMessage mailmessage = new MimeMessage();

            mailmessage.To.Add(new MailboxAddress(email));
            mailmessage.From.Add(new MailboxAddress(options.From));

            mailmessage.Subject = subject;

            var builder = new BodyBuilder ();

            builder.HtmlBody = message;

            if (attachment != null) {
                builder.Attachments.Add(attachment.Filename, new MemoryStream(attachment.Bytes));
            }

            var emailresult = "";

            using (var emailClient = new SmtpClient()) {

                try {
                    emailClient.Connect(options.Host, options.Port, true);
            
                    //Remove any OAuth functionality as we won't be using it. 
                    emailClient.AuthenticationMechanisms.Remove("XOAUTH2");
                    emailClient.Authenticate(options.Username, options.Password);
                    emailClient.Send(mailmessage);
                    emailClient.Disconnect(true);
                    emailresult = "OK."
                } catch (Exception ex) {
                    emailresult = ex.Message;
                }
	
            }

            
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
