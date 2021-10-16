namespace Eventuras.Web.Config
{
    public class AppSettings
    {
        public SmsProvider SmsProvider { get; set; }
        public bool UsePowerOffice { get; set; }
        public bool UseStripeInvoice { get; set; }
        public string AllowedOrigins { get; set; }
    }

    public enum SmsProvider
    {
        Twilio,
        Mock
    }
}
