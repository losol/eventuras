using System;
using System.Linq;
using System.Threading.Tasks;
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
using static Eventuras.Domain.PaymentMethod;

namespace Eventuras.Services.PowerOffice;

public class PowerOfficeService : IInvoicingProvider
{
    private readonly ILogger _logger;
    private readonly IOptions<PowerOfficeOptions> _options;
    private readonly IOrganizationSettingsAccessorService _organizationSettingsAccessorService;
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

    public bool AcceptPaymentProvider(PaymentProvider provider) =>
        provider is PaymentProvider.PowerOfficeEmailInvoice
            or PaymentProvider.PowerOfficeEHFInvoice;

    public async Task<InvoiceResult> CreateInvoiceAsync(InvoiceInfo info)
    {
        try
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
                        new OutgoingInvoiceLine { LineType = VoucherLineType.Text, Description = line.Description });
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
        catch (ApiFieldValidationException ex)
        {
            _logger.LogWarning(ex, "PowerOffice validation error");
            throw new InvoicingException($"Invoice validation failed: {ex.Message}", ex);
        }
    }

    private async Task<Go> GetApiAsync()
    {
        // Read per-organization PowerOffice settings from database
        var appKey = await _organizationSettingsAccessorService
            .GetOrganizationSettingByNameAsync(PowerOfficeConstants.ApplicationKey);

        var clientKey = await _organizationSettingsAccessorService
            .GetOrganizationSettingByNameAsync(PowerOfficeConstants.ClientKey);

        if (string.IsNullOrWhiteSpace(appKey) || string.IsNullOrWhiteSpace(clientKey))
        {
            throw new InvoicingException(
                "PowerOffice credentials not configured for this organization. " +
                "Please configure POWER_OFFICE_APP_KEY and POWER_OFFICE_CLIENT_KEY in organization settings.");
        }

        _logger.LogInformation("Using PowerOffice Client with applicationKey: {AppKey}", appKey);

        return _api ??= await Go.CreateAsync(new AuthorizationSettings
        {
            ApplicationKey = appKey,
            ClientKey = clientKey,
            TokenStore = new BasicInMemoryTokenStore(),
            EndPointHost = new Settings.Host(_options.Value.Mode)
        });
    }

    private async Task<Customer> CreateCustomerIfNotExistsAsync(InvoiceInfo info, InvoiceResult result)
    {
        var api = await GetApiAsync();

        // Search for customer by VAT number
        var vatNumber = info.CustomerVatNumber != null
            ? new string(info.CustomerVatNumber.Where(char.IsDigit).ToArray())
            : null;
        _logger.LogInformation("* VAT number: {VatNumber}", vatNumber);

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

        _logger.LogInformation("Creating new customer");

        if (string.IsNullOrWhiteSpace(info.CustomerName))
        {
            throw new InvoicingException("Customer name is required");
        }

        // If not, create the customer
        var customer = new Customer
        {
            // split name parts from info.CustomerName
            FirstName = info.CustomerName.Split(' ')[0],
            // if there are more than one part, use all the remaining parts as last name
            LastName = info.CustomerName.Split(' ').Length > 1
                ? info.CustomerName.Split(' ')[1..].Aggregate((a, b) => $"{a} {b}")
                : null,
            Name = info.CustomerName,
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

        // Log the initials of the customer
        _logger.LogInformation("Customer name: {CustomerName}", customer.Name);


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
            var product = new Product
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
