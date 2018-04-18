using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using GoApi;
using GoApi.Invoices;
using GoApi.Common;
using GoApi.Core;

using losol.EventManagement.Domain;
using System.Linq;
using GoApi.Party;

namespace losol.EventManagement.Services.PowerOffice
{
    public class PowerOfficeService : IPowerOfficeService
    {
        private readonly Go api;
        public PowerOfficeService(IOptions<PowerOfficeOptions> options)
        {
            GoApi.Global.Settings.Mode = options.Value.Mode;
            var authorizationSettings = new AuthorizationSettings
            {
                ApplicationKey = options.Value.ApplicationKey,
                ClientKey = options.Value.ClientKey,
                TokenStore = new BasicTokenStore(options.Value.TokenStoreName)
            };
            var authorization = new Authorization(authorizationSettings);
            api = new Go(authorization);
        }

        public async Task CreateInvoiceAsync(Order order)
        {
            var customer = await createCustomerIfNotExists(order);
            var invoice = new OutgoingInvoice 
            {    
                Status = OutgoingInvoiceStatus.Approved, // DOES NOT ACTUALLY SEND IT
                OrderDate = order.OrderTime,
                CustomerReference = order.CustomerInvoiceReference,
                CustomerCode = customer.Code,
            };
            foreach(var orderline in order.OrderLines)
            {
                var invoiceLine = new OutgoingInvoiceLine
                {
                    LineType = VoucherLineType.Normal,
                    ProductCode = $"{orderline.ProductId}-{orderline.ProductVariantId}",
                    Quantity = orderline.Quantity,
                    Description = orderline.ProductVariantDescription ?? orderline.ProductDescription,
                    UnitPrice = orderline.Price,
                };
                invoice.OutgoingInvoiceLines.Add(invoiceLine);
            }
            
            api.OutgoingInvoice.Save(invoice);
        }

        private async Task<Customer> createCustomerIfNotExists(Order order) 
        {
            var existingCustomer = !string.IsNullOrWhiteSpace(order.CustomerVatNumber?.Trim()) ? 
                                api.Customer.Get()
                              .FirstOrDefault(c => c.VatNumber == order.CustomerVatNumber)
                              : null;
            existingCustomer = existingCustomer ?? api.Customer.Get().FirstOrDefault(c => c.EmailAddress == order.CustomerEmail);

            if(existingCustomer != null)
            {
                return existingCustomer;
            }

            // Create the customer
            var customer = new Customer
            {
                EmailAddress = order.CustomerEmail,
                Name = order.CustomerName,
                VatNumber = order.CustomerVatNumber
            };
            return await api.Customer.SaveAsync(customer);
        }
    }
}
