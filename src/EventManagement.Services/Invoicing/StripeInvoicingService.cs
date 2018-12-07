using System;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using Microsoft.Extensions.Options;
using Stripe;

namespace losol.EventManagement.Services.Invoicing
{
    public class StripeInvoicingService : IStripeInvoiceService
    {
        public async Task<bool> CreateInvoiceAsync(Order order)
        {
            var customer = await getOrCreateCustomer(order);
            var service = new StripeInvoiceItemService();

            foreach(var line in order.OrderLines)
            {
                var createInvoiceLineOptions = new StripeInvoiceItemCreateOptions
                {
                    Amount = (int)(line.LineTotal * 100m), // inclusive of quantity & tax
                    Currency = "nok", // TODO: read this from config
                    CustomerId = customer.Id,
                    Description = !string.IsNullOrWhiteSpace(line.ProductVariantName) ? $"{line.ProductName} ({line.ProductVariantName})" : line.ProductName,
                };
                var invoiceLineItem = await service.CreateAsync(createInvoiceLineOptions);
            }

            var eventInfo = order.Registration.EventInfo;
            var createInvoiceOptions = new StripeInvoiceCreateOptions
            {
                Billing = StripeBilling.SendInvoice,
                DaysUntilDue = eventInfo.DateStart.HasValue ? ((eventInfo.LastCancellationDate ?? eventInfo.LastRegistrationDate ?? eventInfo.DateStart) - DateTime.UtcNow).Value.Days : 30,
                Description = $"Deltakelse for {order.Registration.ParticipantName} på {order.Registration.EventInfo.Title} "
            };
            var createInvoiceService = new StripeInvoiceService();
            await createInvoiceService.CreateAsync(customer.Id, createInvoiceOptions);

            return true;
        }

        private async Task<StripeCustomer> getOrCreateCustomer(Order order)
        {

            var service = new StripeCustomerService();
            var listOptions = new StripeCustomerListOptions
            {
                Limit = 1
            };
            listOptions.AddExtraParam("email", order.CustomerEmail ?? order.User.Email);
            var customer = (await service.ListAsync(listOptions)).Data.FirstOrDefault();
            if (customer != null) return customer;

            var customerCreateOptions = new StripeCustomerCreateOptions
            {
                Email = order.CustomerEmail ?? order.User.Email,
                BusinessVatId = order.CustomerVatNumber
            };
            return await service.CreateAsync(customerCreateOptions);
        }

        /// <summary>
        /// Call this once before using the StripeInvoicingService
        /// </summary>
        public static void Configure(string secretKey)
        {
            StripeConfiguration.SetApiKey(secretKey);
        }
    }
}
