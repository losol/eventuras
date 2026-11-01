#nullable enable annotations
using System;
using System.Globalization;
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
            _logger.LogDebug("Using customer id {CustomerId}", customer.Id);

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

        var vatNumber = PowerOfficeCustomerMapper.NormalizeVatNumber(info.CustomerVatNumber);
        var customerEmail = NullIfEmpty(info.CustomerEmail);

        // An organization payer is matched on its organization number only. Falling back
        // to email would find the participant's private customer and bill the wrong party.
        var existingCustomer = vatNumber != null
            ? api.Customer.Get().FirstOrDefault(c => c.VatNumber == vatNumber)
            : customerEmail != null
                ? PowerOfficeCustomerMapper.SelectPrivateCustomerByEmail(
                    api.Customer.Get().Where(c => c.EmailAddress == customerEmail).ToList())
                : null;

        if (existingCustomer != null)
        {
            result.LogEntries.Add(
                $"Kunden {existingCustomer.Name} med epost {existingCustomer.EmailAddress} fantes allerede.");
            return existingCustomer;
        }

        _logger.LogInformation("Creating new customer (organization: {IsOrganization})", vatNumber != null);

        var customer = PowerOfficeCustomerMapper.CreateCustomer(info);

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
                SalesAccount = line.SalesAccount ?? await ResolveDefaultSalesAccountAsync()
            };
            await api.Product.SaveAsync(product);
        }
    }

    private async Task<int> ResolveDefaultSalesAccountAsync()
    {
        var configured = await _organizationSettingsAccessorService
            .GetOrganizationSettingByNameAsync(PowerOfficeConstants.DefaultSalesAccountKey);

        if (string.IsNullOrWhiteSpace(configured))
        {
            return PowerOfficeConstants.FallbackSalesAccount;
        }

        if (int.TryParse(configured, NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed))
        {
            return parsed;
        }

        _logger.LogWarning(
            "Invalid value {Value} configured for {Key}; falling back to {Fallback}.",
            configured, PowerOfficeConstants.DefaultSalesAccountKey, PowerOfficeConstants.FallbackSalesAccount);
        return PowerOfficeConstants.FallbackSalesAccount;
    }

    private async Task CreateProductsIfNotExistsAsync(InvoiceInfo info)
    {
        foreach (var line in info.Lines.Where(l => l.Type == InvoiceLineType.Product))
        {
            await CreateProductIfNotExistsAsync(line);
        }
    }

    private static string? NullIfEmpty(string? value) => PowerOfficeCustomerMapper.NullIfEmpty(value);
}
