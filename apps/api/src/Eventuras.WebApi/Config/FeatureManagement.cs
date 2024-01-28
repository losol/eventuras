namespace Eventuras.WebApi.Config
{
    public class FeatureManagement
    {
        public bool UseSentry { get; set; } = false;
        public bool UsePowerOffice { get; set; } = false;
        public bool UseStripeInvoice { get; set; } = false;
    }
}