using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Losol.Communication.Email.SendGrid;

namespace Eventuras.Services.SendGrid
{
    internal class OrganizationSendGridSettings
    {
        [DisplayName("SendGrid enabled")] public bool Enabled { get; set; }

        [Required]
        [DisplayName("SendGrid user")]
        public string Username { get; set; }

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
                User = Username,
                Key = Key,
                EmailAddress = FromAddress,
                Name = FromName
            };
        }
    }
}
