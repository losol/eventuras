using Eventuras.Services.Organizations.Settings;
using Losol.Communication.Email.Smtp;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Eventuras.Services.Smtp
{
    [DisplayName("SMTP")]
    internal class OrganizationSmtpSettings : IConfigurableSettings
    {
        [DisplayName("SMTP enabled")] public bool Enabled { get; set; }
        [DisplayName("SMTP host")] public string Host { get; set; }

        [Range(1, int.MaxValue)]
        [DisplayName("SMTP port")]
        public int Port { get; set; }

        [DisplayName("SMTP username")] public string User { get; set; }
        [DisplayName("SMTP password")] public string Password { get; set; }

        [EmailAddress]
        [DisplayName("From: address")]
        public string FromAddress { get; set; }

        [DisplayName("From: name")] public string FromName { get; set; }

        public SmtpConfig ToSmtpConfig()
        {
            return new SmtpConfig
            {
                Host = Host,
                Port = Port,
                Username = User,
                Password = Password,
                FromEmail = FromAddress,
                FromName = FromName
            };
        }
    }
}
