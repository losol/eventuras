using System;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using GoApi;
using GoApi.Common;
using GoApi.Core;
using GoApi.Invoices;
using GoApi.Party;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using GoApi.Core.Global;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using static Eventuras.Domain.PaymentMethod;

namespace Eventuras.Services.Invoicing
{
    public class PowerOfficeService : IPowerOfficeService
    {
        private readonly ApplicationDbContext _db;
        private readonly IOptions<PowerOfficeOptions> _options;
        private readonly ILogger _logger;
        private Go _api;

        public PowerOfficeService(
            IOptions<PowerOfficeOptions> options,
            ApplicationDbContext db,
            ILogger<PowerOfficeService> logger)
        {
            _db = db ?? throw new ArgumentNullException(nameof(db));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _options = options ?? throw new ArgumentNullException(nameof(options));
            _logger.LogInformation($"Using PowerOffice Client with applicationKey: {options.Value.ApplicationKey}");
        }

        private async Task<Go> GetApiAsync()
        {
            return _api ??= await Go.CreateAsync(new AuthorizationSettings
            {
                ApplicationKey = _options.Value.ApplicationKey,
                ClientKey = _options.Value.ClientKey,
                TokenStore = new BasicTokenStore(_options.Value.TokenStoreName),
                EndPointHost = new Settings.Host(_options.Value.Mode)
            });
        }

        public async Task<bool> CreateInvoiceAsync(Order order)
        {
            var api = await GetApiAsync();
            if (api.Client == null)
            {
                throw new InvalidOperationException("Did not find PowerOffice Client");
            }

            var customer = await createCustomerIfNotExists(order);
            _logger.LogInformation($"* Bruker kunde med epost: {customer.EmailAddress}, id {customer.Id}");

            await createProductsIfNotExists(order);

            var invoice = new OutgoingInvoice
            {
                Status = OutgoingInvoiceStatus.Draft,
                OrderDate = order.OrderTime,
                ContractNo = order.OrderId.ToString(),
                CustomerReference = order.Registration.CustomerInvoiceReference,
                CustomerCode = customer.Code
            };

            if (!string.IsNullOrWhiteSpace(order.Registration.EventInfo.ProjectCode))
            {
                invoice.ProjectCode = order.Registration.EventInfo.ProjectCode;
            }

            foreach (var orderline in order.OrderLines)
            {
                var invoiceLine = new OutgoingInvoiceLine
                {
                    LineType = VoucherLineType.Normal,
                    ProductCode = orderline.ItemCode,
                    Quantity = orderline.Quantity,

                    Description = orderline.ProductVariantId.HasValue ? $"{orderline.ProductName} ({orderline.ProductVariantName})" : orderline.ProductName,
                    UnitPrice = orderline.Price
                };
                invoice.OutgoingInvoiceLines.Add(invoiceLine);
            }

            var invoiceDescription = $"Deltakelse for {order.Registration.ParticipantName} på {order.Registration.EventInfo.Title} ";
            if (order.Registration.EventInfo.DateStart != null)
            {
                invoiceDescription += String.Format("{0:d}", order.Registration.EventInfo.DateStart);
            }
            if (order.Registration.EventInfo.DateEnd != null)
            {
                invoiceDescription += "-" + String.Format("{0:d}", order.Registration.EventInfo.DateEnd);
            }

            invoice.OutgoingInvoiceLines.Add(
                new OutgoingInvoiceLine
                {
                    LineType = VoucherLineType.Text,
                    Description = invoiceDescription
                });

            var result = api.OutgoingInvoice.Save(invoice);
            order.ExternalInvoiceId = invoice.Id.ToString();
            order.AddLog("Sendte fakturautkast til PowerOffice");
            _db.Orders.Update(order);
            await _db.SaveChangesAsync();
            return true;
        }

        private async Task<Customer> createCustomerIfNotExists(Order order)
        {
            var api = await GetApiAsync();

            // Search for customer by VAT number
            Regex rgx = new Regex("[^0-9]");
            var vatNumber = (order.Registration.CustomerVatNumber != null) ?
                rgx.Replace(order.Registration.CustomerVatNumber.ToString(), "") :
                null;

            _logger.LogInformation($"* VAt number: {vatNumber}");
            var existingCustomer = !string.IsNullOrWhiteSpace(vatNumber) ?
                api.Customer.Get()
                    .FirstOrDefault(c => c.VatNumber == order.CustomerVatNumber) :
                null;

            var customerEmail = !string.IsNullOrWhiteSpace(order.Registration.CustomerEmail) ? order.Registration.CustomerEmail : order.Registration.User.Email;
            _logger.LogInformation($"* Customer email: {customerEmail}");

            // If no customer was found by VAT number, then search by email
            if (!string.IsNullOrWhiteSpace(customerEmail))
            {
                existingCustomer = existingCustomer ?? api.Customer.Get().FirstOrDefault(c => c.EmailAddress == customerEmail);
            }
            // If we found a customer, return him!
            if (existingCustomer != null)
            {
                order.AddLog($"Kunden {existingCustomer.Name} med epost {existingCustomer.EmailAddress} fantes allerede.");
                return existingCustomer;
            }

            // If not, create the customer
            var customer = new Customer
            {
                EmailAddress = customerEmail,
                VatNumber = vatNumber,
                InvoiceEmailAddress = customerEmail,

                MailAddress = new Address()
                {
                    Address1 = order.Registration.CustomerAddress,
                    City = order.Registration.CustomerCity,
                    ZipCode = order.Registration.CustomerZip,
                    CountryCode = "NO" // TODO Do this properly...
                }
            };

            if (!string.IsNullOrWhiteSpace(order.Registration.CustomerName))
            {
                customer.Name = order.Registration.CustomerName;
            }
            else
            {
                customer.Name = order.Registration.User.Name;
            }

            if (order.PaymentMethod == PaymentProvider.PowerOfficeEHFInvoice && !string.IsNullOrWhiteSpace(vatNumber))
            {
                customer.InvoiceDeliveryType = InvoiceDeliveryType.EHF;
            }
            else
            {
                customer.InvoiceDeliveryType = InvoiceDeliveryType.PdfByEmail;
            }

            order.AddLog($"Kunden {customer.Name} med epost {customer.EmailAddress} ble opprettet.");
            return await api.Customer.SaveAsync(customer);
        }

        private async Task createProductIfNotExists(OrderLine line)
        {
            var api = await GetApiAsync();
            var exists = api.Product.Get().FirstOrDefault(p => p.Code == line.ItemCode) != null;
            if (!exists)
            {
                GoApi.Products.Product product = new GoApi.Products.Product
                {
                    Code = line.ItemCode,
                    Name = line.ProductVariantId.HasValue ? $"{line.ProductName} ({line.ProductVariantName})" : line.ProductName,
                    Description = line.ProductVariantDescription ?? line.ProductDescription,
                    SalesPrice = line.Price,
                    SalesAccount = 3100
                };
                await api.Product.SaveAsync(product);
            }
        }

        private async Task createProductsIfNotExists(Order order)
        {
            foreach (var line in order.OrderLines)
            {
                await createProductIfNotExists(line);
            }
        }
    }
}
