
using System;
namespace Losol.Communication.Email.Config
{
    public class EmailSettings
    {
        public EmailProvider EmailProvider { get; set; } = 0;
        public SmtpConfig SmtpSettings { get; set; }
    }

    public enum EmailProvider
    {
        SMTP,
        File
    }

    public class SmtpConfig
    {
        public string Host { get; set; }
        public int Port { get; set; } = 587;
        public string DefaultFromName { get; set; }
        public string DefaultFromEmail { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }
}