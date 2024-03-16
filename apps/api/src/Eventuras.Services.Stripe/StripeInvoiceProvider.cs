using System.Linq;
using System.Threading.Tasks;
using Stripe;

namespace Eventuras.Services.Stripe;

public class StripeInvoiceProvider
{

    public async Task ChargeCustomer(Domain.Order order, StripeToken token)
    {
        var options = new StripeChargeCreateOptions
        {
            Amount = (int)(order.TotalAmount * 100m),
            Currency = "nok",
            Description = order.Registration.EventInfo.Title,
            SourceTokenOrExistingSourceId = token.Id,
            ReceiptEmail = order.CustomerEmail
        };
        var service = new StripeChargeService();
        StripeCharge charge = await service.CreateAsync(options);
    }

    private async Task<StripeCustomer> GetOrCreateCustomer(string email)
    {

        var service = new StripeCustomerService();
        var listOptions = new StripeCustomerListOptions
        {
            Limit = 1
        };
        listOptions.AddExtraParam("email", email);
        var customer = (await service.ListAsync(listOptions)).Data.FirstOrDefault();
        if (customer != null)
            return customer;

        var customerCreateOptions = new StripeCustomerCreateOptions
        {
            Email = email
        };
        return await service.CreateAsync(customerCreateOptions);
    }
}
