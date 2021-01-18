namespace Eventuras.WebApi.Config
{
    public class AppSettings
    {
        public EmailProvider EmailProvider { get; set; }
        public SmsProvider SmsProvider { get; set; }
        public string AllowedOrigins { get; set; }
    }

    public enum EmailProvider
    {
        SendGrid,
        Smtp,
        File,
        Mock
    }

    public enum SmsProvider
    {
        Twilio,
        Mock
    }
}
