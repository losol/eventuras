using Eventuras.Services.Organizations.Settings;
using Losol.Communication.Email.SendGrid;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Eventuras.Services.SendGrid
{
    [DisplayName("SendGrid")]
    internal class OrganizationSendGridSettings : IConfigurableSettings
    {
        [DisplayName("SendGrid enabled")] public bool Enabled { get; set; }

        [Required]
        [DisplayName("SendGrid key")]
        public string Key { get; set; }

        [Required]
        [EmailAddress]
        [DisplayName("From: address")]
        public string FromAddress { get; set; }

        [DisplayName("From: name")] public string FromName { get; set; }

        public SendGridConfig ToSendGridConfig()
        {
            return new SendGridConfig
            {
                Key = Key,
                EmailAddress = FromAddress,
                Name = FromName
            };
        }
    }
}
