using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using NodaTime;
using static Eventuras.Domain.PaymentMethod;

namespace Eventuras.Domain;

public class Registration
{
    public enum RegistrationStatus
    {
        Draft = 0,
        Cancelled = 1,
        Verified = 2,
        NotAttended = 3,
        Attended = 4,
        Finished = 5,
        WaitingList = 6
    }

    public enum RegistrationType
    {
        Participant = 0,
        Student = 1,
        Staff = 2,
        Lecturer = 3,
        Artist = 4
    }

    /// <summary>
    ///     Who pays the invoice, as chosen by the participant. OwnCompany and
    ///     OtherOrganization are stored alike; they differ only in how the form is
    ///     prefilled and which fields it requires.
    /// </summary>
    public enum RegistrationPayerType
    {
        Private = 1,
        OwnCompany = 2,
        OtherOrganization = 3
    }

    public int RegistrationId { get; set; }
    public Guid Uuid { get; set; } = Guid.CreateVersion7();
    public int EventInfoId { get; set; }
    public Guid UserId { get; set; }

    public RegistrationStatus Status { get; set; } = RegistrationStatus.Draft;
    public RegistrationType Type { get; set; } = RegistrationType.Participant;

    public bool Diploma { get; set; } = true;

    /// <summary>
    ///     Indicates whether this is a free registration (no payment required).
    /// </summary>
    public bool FreeRegistration { get; set; } = false;

    // The participant - Consider removing, at least the name
    public string ParticipantName { get; set; }

    // Who pays for it?

    /// <summary>Who pays the invoice. Null for registrations made before the payer step existed.</summary>
    public RegistrationPayerType? PayerType { get; set; }

    /// <summary>The payer: the person's own name, or the organization's name.</summary>
    public string CustomerName { get; set; }
    public string CustomerEmail { get; set; }
    public string CustomerAddress { get; set; }
    public string CustomerZip { get; set; }
    public string CustomerCity { get; set; }
    public string CustomerCountry { get; set; }
    public string CustomerVatNumber { get; set; }
    public string CustomerInvoiceReference { get; set; }

    /// <summary>Contact person at an organization payer. <see cref="CustomerEmail" /> is their email.</summary>
    public string CustomerContactName { get; set; }

    /// <summary>A missing or invalid payer field, named as in the registration's customer info.</summary>
    public sealed record PayerProblem(string Field, string Message);

    /// <summary>
    ///     The payer rules, shared by every way of setting the payer. An organization payer needs an
    ///     organization number with digits, a name, a contact person and a contact email; another
    ///     organization also needs an invoice reference. A private payer must not have an organization
    ///     number, since invoicing bills whoever owns it. Without a payer type nothing is checked.
    /// </summary>
    public static IReadOnlyList<PayerProblem> CheckPayer(
        RegistrationPayerType? payerType,
        string vatNumber,
        string name,
        string email,
        string contactName,
        string invoiceReference)
    {
        var problems = new List<PayerProblem>();

        if (payerType == RegistrationPayerType.Private)
        {
            if (!string.IsNullOrWhiteSpace(vatNumber))
            {
                problems.Add(new PayerProblem("VatNumber", "A private payer cannot have an organization number."));
            }

            return problems;
        }

        if (payerType is not (RegistrationPayerType.OwnCompany or RegistrationPayerType.OtherOrganization))
        {
            return problems;
        }

        if (string.IsNullOrWhiteSpace(vatNumber))
        {
            problems.Add(new PayerProblem("VatNumber", "Organization number is required for organization payers."));
        }
        else if (!vatNumber.Any(char.IsDigit))
        {
            problems.Add(new PayerProblem("VatNumber", "Organization number must contain digits."));
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            problems.Add(new PayerProblem("Name", "Organization name is required for organization payers."));
        }

        if (string.IsNullOrWhiteSpace(contactName))
        {
            problems.Add(new PayerProblem("ContactName", "Contact person is required for organization payers."));
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            problems.Add(new PayerProblem("Email", "Contact email is required for organization payers."));
        }

        if (payerType == RegistrationPayerType.OtherOrganization && string.IsNullOrWhiteSpace(invoiceReference))
        {
            problems.Add(new PayerProblem("InvoiceReference",
                "Invoice reference is required when another organization pays."));
        }

        return problems;
    }

    /// <summary>The payer rules applied to this registration's saved payer details.</summary>
    public IReadOnlyList<PayerProblem> FindPayerProblems() =>
        CheckPayer(PayerType, CustomerVatNumber, CustomerName, CustomerEmail, CustomerContactName,
            CustomerInvoiceReference);

    /// <summary>True when the payer details and payment method match <paramref name="other" />.</summary>
    public bool HasSamePayerAs(Registration other) =>
        PayerType == other.PayerType &&
        CustomerName == other.CustomerName &&
        CustomerEmail == other.CustomerEmail &&
        CustomerAddress == other.CustomerAddress &&
        CustomerZip == other.CustomerZip &&
        CustomerCity == other.CustomerCity &&
        CustomerCountry == other.CustomerCountry &&
        CustomerVatNumber == other.CustomerVatNumber &&
        CustomerInvoiceReference == other.CustomerInvoiceReference &&
        CustomerContactName == other.CustomerContactName &&
        PaymentMethod == other.PaymentMethod;

    public string Notes { get; set; }

    public Instant? RegistrationTime { get; set; } = SystemClock.Instance.Now();

    public PaymentProvider PaymentMethod { get; set; } = PaymentProvider.EmailInvoice; // Fallback default; the service layer resolves this from the database at registration time

    public int? CertificateId { get; set; }

    public string CertificateComment { get; set; }

    // Navigation properties
    public EventInfo EventInfo { get; set; }

    [JsonIgnore] public Certificate Certificate { get; set; }

    public ApplicationUser User { get; set; }

    public List<Order> Orders { get; set; }

    public bool HasOrder => Orders != null && Orders.Count > 0;
    public bool HasCertificate => CertificateId != null;

    public Certificate CreateCertificate()
    {
        if (Certificate != null)
        {
            throw new InvalidOperationException(
                $"{nameof(Registration)}.{nameof(Certificate)} is already set for registration {RegistrationId}");
        }

        Certificate = new Certificate();
        UpdateCertificate();
        return Certificate;
    }

    public Certificate UpdateCertificate()
    {
        if (Certificate == null)
        {
            throw new InvalidOperationException($"{nameof(Registration)}.{nameof(Certificate)} is null");
        }

        if (EventInfo == null)
        {
            throw new InvalidOperationException($"{nameof(Registration)}.{nameof(EventInfo)} is null");
        }

        if (User == null)
        {
            throw new InvalidOperationException($"{nameof(Registration)}.{nameof(User)} is null");
        }

        EventInfo.FillCertificate(Certificate);
        Certificate.Comment = CertificateComment;
        Certificate.RecipientName = User.Name;
        Certificate.RecipientEmail = User.Email;
        Certificate.RecipientUserId = User.Id;
        return Certificate;
    }

}
