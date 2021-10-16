namespace Eventuras.WebApi.Config
{
    public class AppSettings
    {
        public SmsProvider SmsProvider { get; set; }
        public string AllowedOrigins { get; set; }
    }

    public enum SmsProvider
    {
        Twilio,
        Mock
    }
}
