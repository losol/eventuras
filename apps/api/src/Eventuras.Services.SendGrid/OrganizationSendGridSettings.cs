using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Eventuras.Services.Organizations.Settings;
using Losol.Communication.Email.SendGrid;

namespace Eventuras.Services.SendGrid;

[DisplayName("SendGrid")]
internal class OrganizationSendGridSettings : IConfigurableSettings
{
    [Required]
    [DisplayName("SendGrid key")]
    public string Key { get; set; }

    [Required]
    [EmailAddress]
    [DisplayName("From: address")]
    public string FromAddress { get; set; }

    [DisplayName("From: name")] public string FromName { get; set; }
    [DisplayName("SendGrid enabled")] public bool Enabled { get; set; }

    public SendGridConfig ToSendGridConfig() =>
        new() { Key = Key, EmailAddress = FromAddress, Name = FromName };
}
