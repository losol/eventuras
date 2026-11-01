#nullable enable

using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Eventuras.Domain;
using static Eventuras.Domain.Registration;

namespace Eventuras.WebApi.Controllers.v3.Registrations;

/// <summary>
///     The payer of a registration. When payerType is OwnCompany or OtherOrganization, the
///     organization number, name, contact person and contact email are required, and
///     OtherOrganization also requires an invoice reference. Without a payer type only the
///     email format is checked, as before the payer step existed.
/// </summary>
public class RegistrationCustomerInfoDto : IValidatableObject
{
    /// <summary>Who pays the invoice.</summary>
    public RegistrationPayerType? PayerType { get; set; }

    /// <summary>The organization number of an organization payer.</summary>
    public string? VatNumber { get; set; }

    /// <summary>The payer: the person's own name, or the organization's name.</summary>
    public string? Name { get; set; }

    /// <summary>Where the invoice is sent: the person's own email, or the contact person's email.</summary>
    [EmailAddress] public string? Email { get; set; }

    /// <summary>Street address.</summary>
    public string? Address { get; set; }

    public string? Zip { get; set; }

    public string? City { get; set; }

    public string? Country { get; set; }

    public string? InvoiceReference { get; set; }

    /// <summary>Contact person at an organization payer.</summary>
    public string? ContactName { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (PayerType is not (RegistrationPayerType.OwnCompany or RegistrationPayerType.OtherOrganization))
        {
            yield break;
        }

        if (string.IsNullOrWhiteSpace(VatNumber))
        {
            yield return new ValidationResult("Organization number is required for organization payers.",
                [nameof(VatNumber)]);
        }

        if (string.IsNullOrWhiteSpace(Name))
        {
            yield return new ValidationResult("Organization name is required for organization payers.",
                [nameof(Name)]);
        }

        if (string.IsNullOrWhiteSpace(ContactName))
        {
            yield return new ValidationResult("Contact person is required for organization payers.",
                [nameof(ContactName)]);
        }

        if (string.IsNullOrWhiteSpace(Email))
        {
            yield return new ValidationResult("Contact email is required for organization payers.",
                [nameof(Email)]);
        }

        if (PayerType == RegistrationPayerType.OtherOrganization && string.IsNullOrWhiteSpace(InvoiceReference))
        {
            yield return new ValidationResult("Invoice reference is required when another organization pays.",
                [nameof(InvoiceReference)]);
        }
    }

    public void CopyTo(Registration registration)
    {
        registration.PayerType = PayerType;
        registration.CustomerName = Name;
        registration.CustomerEmail = Email;
        registration.CustomerVatNumber = VatNumber;
        registration.CustomerAddress = Address;
        registration.CustomerZip = Zip;
        registration.CustomerCity = City;
        registration.CustomerCountry = Country;
        registration.CustomerInvoiceReference = InvoiceReference;
        registration.CustomerContactName = ContactName;
    }
}
