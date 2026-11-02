#nullable enable annotations
using System.Collections.Generic;
using System.Linq;
using Eventuras.Services.Invoicing;
using GoApi.Common;
using GoApi.Core;
using GoApi.Core.Global;
using GoApi.Party;
using static Eventuras.Domain.PaymentMethod;

namespace Eventuras.Services.PowerOffice;

/// <summary>
///     Pure mapping and matching rules for PowerOffice customers, kept apart from
///     <see cref="PowerOfficeService" /> so they can be tested without the PowerOffice API.
/// </summary>
public static class PowerOfficeCustomerMapper
{
    /// <summary>
    ///     Keeps only the digits of an organization number, so "NO 974 760 673 MVA"
    ///     becomes "974760673". Returns null when no digits are left.
    /// </summary>
    public static string? NormalizeVatNumber(string? vatNumber)
    {
        if (string.IsNullOrWhiteSpace(vatNumber))
        {
            return null;
        }

        var digits = new string(vatNumber.Where(char.IsDigit).ToArray());
        return digits.Length == 0 ? null : digits;
    }

    /// <summary>
    ///     Picks the customer a private payer's invoice goes to, from customers that share
    ///     the payer's email. Organization customers are skipped: their email belongs to a
    ///     contact person, who may also register and pay privately.
    /// </summary>
    public static Customer? SelectPrivateCustomerByEmail(IEnumerable<Customer> customersWithEmail) =>
        customersWithEmail.FirstOrDefault(c => string.IsNullOrWhiteSpace(c.VatNumber));

    /// <summary>
    ///     Builds a new PowerOffice customer from the invoice payer. A payer with an
    ///     organization number is created as an organization (no first/last name split,
    ///     EHF delivery when requested); otherwise as a person.
    /// </summary>
    public static Customer CreateCustomer(InvoiceInfo info)
    {
        if (string.IsNullOrWhiteSpace(info.CustomerName))
        {
            throw new InvoicingException("Customer name is required");
        }

        var name = info.CustomerName.Trim();
        var vatNumber = NormalizeVatNumber(info.CustomerVatNumber);
        var email = NullIfEmpty(info.CustomerEmail);
        var isOrganization = vatNumber != null;

        var customer = new Customer
        {
            Name = name,
            EmailAddress = email,
            VatNumber = vatNumber,
            InvoiceEmailAddress = email,
            MailAddress = new Address
            {
                Address1 = NullIfEmpty(info.CustomerAddress),
                City = NullIfEmpty(info.CustomerCity),
                ZipCode = NullIfEmpty(info.CustomerZip),
                CountryCode = NullIfEmpty(info.CustomerCountry)
            },
            InvoiceDeliveryType = isOrganization && info.PaymentMethod == PaymentProvider.PowerOfficeEHFInvoice
                ? InvoiceDeliveryType.EHF
                : InvoiceDeliveryType.PdfByEmail
        };

        if (!isOrganization)
        {
            var parts = name.Split(' ', System.StringSplitOptions.RemoveEmptyEntries);
            customer.FirstName = parts[0];
            customer.LastName = parts.Length > 1 ? string.Join(' ', parts[1..]) : null;
        }

        return customer;
    }

    // PowerOffice Go v3 rejects empty strings in optional fields with a validation error.
    internal static string? NullIfEmpty(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value;
}
