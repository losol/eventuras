using Eventuras.Services.Invoicing;
using Eventuras.Services.Organizations.Settings;
using GoApi;
using GoApi.Common;
using GoApi.Core;
using GoApi.Core.Global;
using GoApi.Invoices;
using GoApi.Party;
using GoApi.Products;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using static Eventuras.Domain.PaymentMethod;

namespace Eventuras.Services.PowerOffice
{
    public class PowerOfficeService : IInvoicingProvider
    {
        private readonly IOptions<PowerOfficeOptions> _options;
        private readonly IOrganizationSettingsAccessorService _organizationSettingsAccessorService;
        private readonly ILogger _logger;
        private Go _api;

        public PowerOfficeService(
            IOptions<PowerOfficeOptions> options,
            ILogger<PowerOfficeService> logger,
            IOrganizationSettingsAccessorService organizationSettingsAccessorService)
        {
            _logger = logger ?? throw
                new ArgumentNullException(nameof(logger));

            _organizationSettingsAccessorService = organizationSettingsAccessorService ?? throw
                new ArgumentNullException(nameof(organizationSettingsAccessorService));

            _options = options ?? throw
                new ArgumentNullException(nameof(options));
        }

        public bool AcceptPaymentProvider(PaymentProvider provider)
        {
            return provider is PaymentProvider.PowerOfficeEmailInvoice
                or PaymentProvider.PowerOfficeEHFInvoice;
        }

        private async Task<Go> GetApiAsync()
        {
            // read per-org power office settings,
            // fallback to system-wide settings if not set.

            var appKey = await _organizationSettingsAccessorService
                             .GetOrganizationSettingByNameAsync(PowerOfficeConstants.ApplicationKey)
                         ?? _options.Value.ApplicationKey;

            var clientKey = await _organizationSettingsAccessorService
                                .GetOrganizationSettingByNameAsync(PowerOfficeConstants.ClientKey)
                            ?? _options.Value.ClientKey;

            _logger.LogInformation("Using PowerOffice Client with applicationKey: {AppKey}", appKey);

            return _api ??= await Go.CreateAsync(new AuthorizationSettings
            {
                ApplicationKey = appKey,
                ClientKey = clientKey,
                TokenStore = new BasicInMemoryTokenStore(),
                EndPointHost = new Settings.Host(_options.Value.Mode)
            });
        }

        public async Task<InvoiceResult> CreateInvoiceAsync(InvoiceInfo info)
        {
            var api = await GetApiAsync();
            if (api.Client == null)
            {
                throw new InvoicingException("Did not find PowerOffice Client");
            }

            var result = new InvoiceResult();
            var customer = await CreateCustomerIfNotExistsAsync(info, result);
            _logger.LogInformation("* Bruker kunde med epost: {CustomerEmailAddress}, id {CustomerId}",
                customer.EmailAddress, customer.Id);

            await CreateProductsIfNotExistsAsync(info);

            var invoice = new OutgoingInvoice
            {
                Status = OutgoingInvoiceStatus.Draft,
                OrderDate = info.OrderDate?.ToDateTimeUnspecified(),
                ContractNo = info.OrderId,
                CustomerReference = info.CustomerInvoiceReference,
                CustomerCode = customer.Code
            };

            if (!string.IsNullOrWhiteSpace(info.ProjectCode))
            {
                invoice.ProjectCode = info.ProjectCode;
            }

            foreach (var line in info.Lines)
            {
                if (line.Type == InvoiceLineType.Text)
                {
                    invoice.OutgoingInvoiceLines.Add(
                        new OutgoingInvoiceLine
                        {
                            LineType = VoucherLineType.Text,
                            Description = line.Description
                        });
                }
                else
                {
                    var invoiceLine = new OutgoingInvoiceLine
                    {
                        LineType = VoucherLineType.Normal,
                        ProductCode = line.ProductCode,
                        Quantity = line.Quantity,
                        Description = line.Description,
                        UnitPrice = line.Price
                    };
                    invoice.OutgoingInvoiceLines.Add(invoiceLine);
                }
            }

            var outgoingInvoice = await api.OutgoingInvoice.SaveAsync(invoice);
            result.InvoiceId = outgoingInvoice.Id.ToString();
            return result;
        }

        private async Task<Customer> CreateCustomerIfNotExistsAsync(InvoiceInfo info, InvoiceResult result)
        {
            var api = await GetApiAsync();

            // Search for customer by VAT number
            var rgx = new Regex("[^0-9]");
            var vatNumber = info.CustomerVatNumber != null ? rgx.Replace(info.CustomerVatNumber, "") : null;
            _logger.LogInformation("* VAt number: {VatNumber}", vatNumber);

            var existingCustomer = !string.IsNullOrWhiteSpace(vatNumber)
                ? api.Customer.Get()
                    .FirstOrDefault(c => c.VatNumber == info.CustomerVatNumber)
                : null;

            var customerEmail = info.CustomerEmail;
            _logger.LogInformation("* Customer email: {CustomerEmail}", customerEmail);

            // If no customer was found by VAT number, then search by email
            if (!string.IsNullOrWhiteSpace(customerEmail))
            {
                existingCustomer ??= api.Customer.Get()
                    .FirstOrDefault(c => c.EmailAddress == customerEmail);
            }

            // If we found a customer, return him!
            if (existingCustomer != null)
            {
                result.LogEntries.Add(
                    $"Kunden {existingCustomer.Name} med epost {existingCustomer.EmailAddress} fantes allerede.");
                return existingCustomer;
            }

            // If not, create the customer
            var customer = new Customer
            {
                EmailAddress = customerEmail,
                VatNumber = vatNumber,
                InvoiceEmailAddress = customerEmail,

                MailAddress = new Address
                {
                    Address1 = info.CustomerAddress,
                    City = info.CustomerCity,
                    ZipCode = info.CustomerZip,
                    CountryCode = info.CustomerCountry
                }
            };

            customer.Name = info.CustomerName;

            if (info.PaymentMethod == PaymentProvider.PowerOfficeEHFInvoice && !string.IsNullOrWhiteSpace(vatNumber))
            {
                customer.InvoiceDeliveryType = InvoiceDeliveryType.EHF;
            }
            else
            {
                customer.InvoiceDeliveryType = InvoiceDeliveryType.PdfByEmail;
            }

            result.LogEntries.Add($"Kunden {customer.Name} med epost {customer.EmailAddress} ble opprettet.");
            return await api.Customer.SaveAsync(customer);
        }

        private async Task CreateProductIfNotExistsAsync(InvoiceLine line)
        {
            var api = await GetApiAsync();
            var exists = api.Product.Get().FirstOrDefault(p => p.Code == line.ProductCode) != null;
            if (!exists)
            {
                Product product = new Product
                {
                    Code = line.ProductCode,
                    Name = line.Description,
                    Description = line.ProductDescription,
                    SalesPrice = line.Price,
                    SalesAccount = 3100
                };
                await api.Product.SaveAsync(product);
            }
        }

        private async Task CreateProductsIfNotExistsAsync(InvoiceInfo info)
        {
            foreach (var line in info.Lines.Where(l => l.Type == InvoiceLineType.Product))
            {
                await CreateProductIfNotExistsAsync(line);
            }
        }
    }
}
