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

        StripeConfiguration.ApiKey = options.Value.SecretKey;
    }

    public bool AcceptPaymentProvider(Domain.PaymentMethod.PaymentProvider provider) =>
        provider is Domain.PaymentMethod.PaymentProvider.StripeInvoice;

    public async Task<InvoiceResult> CreateInvoiceAsync(InvoiceInfo info)
    {
        var customer = await GetOrCreateCustomer(info);
        var service = new InvoiceItemService();

        foreach (var line in info.Lines.Where(l => l.Type == InvoiceLineType.Product))
        {
            await service.CreateAsync(new InvoiceItemCreateOptions
            {
                Amount = (int)(line.Total ?? 0 * 100m), // inclusive of quantity & tax
                Currency = line.Currency,
                Customer = customer.Id,
                Description = line.Description
            });
        }

        var createInvoiceOptions = new InvoiceCreateOptions
        {
            CollectionMethod = "send_invoice",
            DaysUntilDue = info.DueDate.HasValue
                ? (info.DueDate.Value - SystemClock.Instance.Today()).Days
                : 30,
            Description = string.Join(", ", info.Lines
                .Where(l => l.Type == InvoiceLineType.Text)
                .Select(l => l.Description)),
            Customer = customer.Id
        };
        var createInvoiceService = new InvoiceService();
        var stripeInvoice = await createInvoiceService.CreateAsync(createInvoiceOptions);
        return new InvoiceResult(stripeInvoice.Id);
    }

    private static async Task<Customer> GetOrCreateCustomer(InvoiceInfo info)
    {
        var service = new CustomerService();
        var listOptions = new CustomerListOptions
        {
            Limit = 1,
            Email = info.CustomerEmail
        };
        var customer = (await service.ListAsync(listOptions)).Data.FirstOrDefault();
        if (customer != null)
        {
            return customer;
        }

        var customerCreateOptions = new CustomerCreateOptions
        {
            Email = info.CustomerEmail,
            TaxIdData = info.CustomerVatNumber != null
                ? new System.Collections.Generic.List<CustomerTaxIdDataOptions>
                {
                    new CustomerTaxIdDataOptions
                    {
                        Type = "eu_vat",
                        Value = info.CustomerVatNumber
                    }
                }
                : null
        };
        return await service.CreateAsync(customerCreateOptions);
    }
}
