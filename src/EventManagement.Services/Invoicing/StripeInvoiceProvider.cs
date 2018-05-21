using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using Stripe;

namespace EventManagement.Services.Invoicing
{
    public class StripeInvoiceProvider
    {

        public async Task ChargeCustomer(Order order, StripeToken token)
        {
            var options = new StripeChargeCreateOptions {
                Amount = (int)(order.TotalAmount * 100m),
                Currency = "nok",
                Description = order.Registration.EventInfo.Title,
                SourceTokenOrExistingSourceId = token.Id,
                ReceiptEmail = order.CustomerEmail
            };
            var service = new StripeChargeService();
            StripeCharge charge = await service.CreateAsync(options);
        }

        private async Task<StripeCustomer> getOrCreateCustomer(string email)
        {

            var service = new StripeCustomerService();
            var listOptions = new StripeCustomerListOptions
            {
                Limit = 1
            };
            listOptions.AddExtraParam("email", email);
            var customer = (await service.ListAsync(listOptions)).Data.FirstOrDefault();
            if (customer != null) return customer;

            var customerCreateOptions = new StripeCustomerCreateOptions
            {
                Email = email
            };
            return await service.CreateAsync(customerCreateOptions);
        }
    }
}
