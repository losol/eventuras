
using System;
namespace Losol.Communication.Email.Config
{
    public class EmailSettings
    {
        public EmailProvider EmailProvider { get; set; }
        public SmtpConfiguration SmtpSettings { get; set; }
    }

    public enum EmailProvider
    {
        SMTP,
        File
    }

    public class SmtpConfiguration
    {
        public string Host { get; set; }
        public int Port { get; set; } = 587;
        public string DefaultFromAddress { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }
}