using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Eventuras.Services.Organizations.Settings;
using Losol.Communication.Sms.Twilio;

namespace Eventuras.Services.Twilio;

[DisplayName("Twilio")]
internal class OrganizationTwilioSettings : IConfigurableSettings
{
    [Required]
    [DisplayName("From number")]
    public string From { get; set; }

    [Required] [DisplayName("Twilio SID")] public string Sid { get; set; }

    [Required] [DisplayName("Auth token")] public string AuthToken { get; set; }
    [DisplayName("Twilio enabled")] public bool Enabled { get; set; }

    public TwilioOptions ToTwilioOptions() =>
        new() { From = From, Sid = Sid, AuthToken = AuthToken };
}
