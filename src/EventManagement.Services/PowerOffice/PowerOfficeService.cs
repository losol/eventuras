using System.Linq;
using System.Threading.Tasks;
using GoApi;
using GoApi.Common;
using GoApi.Core;
using GoApi.Invoices;
using GoApi.Party;
using losol.EventManagement.Domain;
using Microsoft.Extensions.Options;

namespace losol.EventManagement.Services.PowerOffice {
    public class PowerOfficeService : IInvoicingService {

        private readonly Go api;

        public PowerOfficeService (IOptions<PowerOfficeOptions> options) {
            GoApi.Global.Settings.Mode = options.Value.Mode;
            var authorizationSettings = new AuthorizationSettings {
                ApplicationKey = options.Value.ApplicationKey,
                ClientKey = options.Value.ClientKey,
                TokenStore = new BasicTokenStore (options.Value.TokenStoreName)
            };
            var authorization = new Authorization (authorizationSettings);
            api = new Go (authorization);
        }

        public async Task CreateInvoiceAsync (Order order) {
            var customer = await createCustomerIfNotExists (order);
            await createProductsIfNotExists (order);
            var invoice = new OutgoingInvoice {
                Status = OutgoingInvoiceStatus.Draft, 
                OrderDate = order.OrderTime,
                CustomerReference = order.CustomerInvoiceReference,
                CustomerCode = customer.Code,

            };

            foreach (var orderline in order.OrderLines) {
                var invoiceLine = new OutgoingInvoiceLine {
                    LineType = VoucherLineType.Normal,
                    ProductCode = orderline.ItemCode,
                    Quantity = orderline.Quantity,

                    Description = orderline.ProductVariantId.HasValue? $"{orderline.ProductName} ({orderline.ProductVariantName})": orderline.ProductName,
                    UnitPrice = orderline.Price
                };
                invoice.OutgoingInvoiceLines.Add (invoiceLine);
            }

            invoice.OutgoingInvoiceLines.Add (
                new OutgoingInvoiceLine {
                    LineType = VoucherLineType.Text,
                    Description = $"Participation for {order.Registration.ParticipantName} at {order.Registration.EventInfo.Title}, {order.Registration.EventInfo.DateStart}"
                });
            api.OutgoingInvoice.Save (invoice);
            }

        private async Task<Customer> createCustomerIfNotExists (Order order) {
            // Search for customer by VAT number
            var existingCustomer = !string.IsNullOrWhiteSpace (order.CustomerVatNumber?.Trim ()) ?
                api.Customer.Get ()
                .FirstOrDefault (c => c.VatNumber == order.CustomerVatNumber) :
                null;

            // If no customer was found by VAT number, then search by email
            existingCustomer = existingCustomer ?? api.Customer.Get ().FirstOrDefault (c => c.EmailAddress == order.CustomerEmail);

            // If we found a customer, return him!
            if (existingCustomer != null) {
                return existingCustomer;
            }

            // If not, create the customer
            var customer = new Customer {
                EmailAddress = order.CustomerEmail ?? order.User.Email,
                Name = order.CustomerName ?? order.User.Name,
                VatNumber = order.CustomerVatNumber,
                InvoiceEmailAddress = order.CustomerEmail ?? order.User.Email
            };

            if (order.PaymentMethod.Name == "EHF" && string.IsNullOrWhiteSpace (order.CustomerVatNumber)) {
                customer.InvoiceDeliveryType = InvoiceDeliveryType.EHF;
            } 
            else {
                customer.InvoiceDeliveryType = InvoiceDeliveryType.PdfByEmail;
            }
            return await api.Customer.SaveAsync (customer);
        }

        private async Task createProductIfNotExists (OrderLine line) {
            var exists = api.Product.Get ().FirstOrDefault (p => p.Code == line.ItemCode) != null;
            if (!exists) {
                GoApi.Products.Product product = new GoApi.Products.Product {
                    Code = line.ItemCode,
                    Name = line.ProductVariantId.HasValue ? $"{line.ProductName} ({line.ProductVariantName})" : line.ProductName,
                    Description = line.ProductVariantDescription ?? line.ProductDescription,
                    SalesPrice = line.Price
                };
                await api.Product.SaveAsync (product);
            }
        }

        private async Task createProductsIfNotExists (Order order) {
            var tasks = order.OrderLines.Select (l => createProductIfNotExists (l));
            await Task.WhenAll (tasks);
        }
    }
}