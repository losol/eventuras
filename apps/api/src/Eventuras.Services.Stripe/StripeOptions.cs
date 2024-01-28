using System.ComponentModel.DataAnnotations;

namespace Eventuras.Services.Stripe
{
    public class StripeOptions
    {
        [Required] public string SecretKey { get; set; }

        [Required] public string PublishableKey { get; set; }
    }
}
