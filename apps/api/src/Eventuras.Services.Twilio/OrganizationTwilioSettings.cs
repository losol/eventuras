using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Eventuras.Services.Organizations.Settings;
using Losol.Communication.Sms.Twilio;

namespace Eventuras.Services.Twilio;

[DisplayName("Twilio")]
internal class OrganizationTwilioSettings : IConfigurableSettings
{
    [DisplayName("Twilio enabled")] public bool Enabled { get; set; }

    [Required]
    [DisplayName("From number")]
    public string From { get; set; }

    [Required][DisplayName("Twilio SID")] public string Sid { get; set; }

    [Required][DisplayName("Auth token")] public string AuthToken { get; set; }

    public TwilioOptions ToTwilioOptions()
    {
        return new TwilioOptions
        {
            From = From,
            Sid = Sid,
            AuthToken = AuthToken
        };
    }
}
