using System;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Invoicing;
using Microsoft.Extensions.Options;
using NodaTime;
using Stripe;

namespace Eventuras.Services.Stripe;

public class StripeInvoicingService : IInvoicingProvider
{
    public StripeInvoicingService(IOptions<StripeOptions> options)
    {
        if (options == null)
        {
            throw new ArgumentNullException(nameof(options));
        }

        StripeConfiguration.SetApiKey(options.Value.SecretKey);
    }

    public bool AcceptPaymentProvider(PaymentMethod.PaymentProvider provider) =>
        provider is PaymentMethod.PaymentProvider.StripeInvoice;

    public async Task<InvoiceResult> CreateInvoiceAsync(InvoiceInfo info)
    {
        var customer = await GetOrCreateCustomer(info);
        var service = new StripeInvoiceItemService();

        foreach (var line in info.Lines.Where(l => l.Type == InvoiceLineType.Product))
        {
            await service.CreateAsync(new StripeInvoiceItemCreateOptions
            {
                Amount = (int)(line.Total ?? 0 * 100m), // inclusive of quantity & tax
                Currency = line.Currency,
                CustomerId = customer.Id,
                Description = line.Description
            });
        }

        var createInvoiceOptions = new StripeInvoiceCreateOptions
        {
            Billing = StripeBilling.SendInvoice,
            DaysUntilDue = info.DueDate.HasValue
                ? (info.DueDate.Value - SystemClock.Instance.Today()).Days
                : 30,
            Description = string.Join(", ", info.Lines
                .Where(l => l.Type == InvoiceLineType.Text)
                .Select(l => l.Description))
        };
        var createInvoiceService = new StripeInvoiceService();
        var stripeInvoice = await createInvoiceService.CreateAsync(customer.Id, createInvoiceOptions);
        return new InvoiceResult(stripeInvoice.Id);
    }

    private static async Task<StripeCustomer> GetOrCreateCustomer(InvoiceInfo info)
    {
        var service = new StripeCustomerService();
        var listOptions = new StripeCustomerListOptions { Limit = 1 };
        listOptions.AddExtraParam("email", info.CustomerEmail);
        var customer = (await service.ListAsync(listOptions)).Data.FirstOrDefault();
        if (customer != null)
        {
            return customer;
        }

        var customerCreateOptions = new StripeCustomerCreateOptions
        {
            Email = info.CustomerEmail, BusinessVatId = info.CustomerVatNumber
        };
        return await service.CreateAsync(customerCreateOptions);
    }
}
