namespace Eventuras.WebApi.Config;

public class FeatureManagement
{
    public bool UsePowerOffice { get; set; } = false;
    public bool UseStripeInvoice { get; set; } = false;
    public bool EnableApiDocs { get; set; } = false;
}
