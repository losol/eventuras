using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Eventuras.Services.Organizations.Settings;
using Losol.Communication.Email.Smtp;

namespace Eventuras.Services.Smtp
{
    [DisplayName("SMTP")]
    [ConfigurableSettingsValidation]
    internal class OrganizationSmtpSettings : IConfigurableSettings
    {
        [DisplayName("SMTP enabled")] public bool Enabled { get; set; }
        [DisplayName("SMTP host")] public string Host { get; set; }

        [Range(1, int.MaxValue)]
        [DisplayName("SMTP port")]
        public int Port { get; set; }

        [DisplayName("SMTP username")] public string User { get; set; }
        [DisplayName("SMTP password")] public string Password { get; set; }
        [EmailAddress] [DisplayName("From:")] public string From { get; set; }

        public SmtpConfig ToSmtpConfig()
        {
            return new SmtpConfig
            {
                Host = Host,
                Port = Port,
                Username = User,
                Password = Password,
                From = From
            };
        }
    }
}
