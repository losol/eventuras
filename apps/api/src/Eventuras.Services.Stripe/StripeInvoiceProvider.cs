using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Stripe;

namespace Eventuras.Services.Stripe;

public class StripeInvoiceProvider
{
    public async Task ChargeCustomer(Order order, Token token)
    {
        var options = new ChargeCreateOptions
        {
            Amount = (int)(order.TotalAmount * 100m),
            Currency = "nok",
            Description = order.Registration.EventInfo.Title,
            Source = token.Id,
            ReceiptEmail = order.CustomerEmail
        };
        var service = new ChargeService();
        var charge = await service.CreateAsync(options);
    }

    private async Task<Customer> GetOrCreateCustomer(string email)
    {
        var service = new CustomerService();
        var listOptions = new CustomerListOptions
        {
            Limit = 1,
            Email = email
        };
        var customer = (await service.ListAsync(listOptions)).Data.FirstOrDefault();
        if (customer != null)
        {
            return customer;
        }

        var customerCreateOptions = new CustomerCreateOptions { Email = email };
        return await service.CreateAsync(customerCreateOptions);
    }
}
