using System;
using System.Collections.Generic;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Losol.Communication.Email.Config;
using MailKit.Net.Smtp;
using MimeKit;

namespace Losol.Communication.Email.Services
{
    public class EmailSender : IEmailSender
    {

        private SmtpConfig _smtpConfig;

        public EmailSender(SmtpConfig smtpConfig)
        {
            _smtpConfig = smtpConfig;
        }

        public async Task SendEmailAsync(string name, string email, string subject, string htmlMessage)
        {
            try
            {
                var mimeMessage = new MimeMessage();
                mimeMessage.From.Add(new MailboxAddress(_smtpConfig.DefaultFromName, _smtpConfig.DefaultFromEmail));
                mimeMessage.To.Add(new MailboxAddress(name, email));
                mimeMessage.Subject = subject;

                // Check out bodybuilder 
                mimeMessage.Body = new TextPart("html")
                {
                    Text = htmlMessage
                };

                using (var client = new SmtpClient())
                {
                    client.Connect(_smtpConfig.Host, _smtpConfig.Port, true);
                    client.Authenticate(
                        _smtpConfig.Username,
                        _smtpConfig.Password
                        );

                    await client.SendAsync(mimeMessage);
                    Console.WriteLine("The mail has been sent successfully !!");
                    Console.ReadLine();
                    await client.DisconnectAsync(true);
                }

                return;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


    }
}