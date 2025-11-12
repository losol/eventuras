using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
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

    public int RegistrationId { get; set; }
    public int EventInfoId { get; set; }
    public string UserId { get; set; }

    public RegistrationStatus Status { get; set; } = RegistrationStatus.Draft;
    public RegistrationType Type { get; set; } = RegistrationType.Participant;

    public bool Diploma { get; set; } = true;

    /// <summary>
    ///     Indicates whether this is a free registration (no payment required).
    /// </summary>
    public bool FreeRegistration { get; set; } = false;

    // The participant - Consider removing, at least the name
    public string ParticipantName { get; set; }

    [Obsolete] public string ParticipantJobTitle { get; set; }

    [Obsolete] public string ParticipantEmployer { get; set; }

    [Obsolete] public string ParticipantCity { get; set; }

    [Obsolete] [NotMapped] private IEnumerable<string> NameParts => ParticipantName?.Split(" ")?.Select(p => p.Trim());

    [Obsolete]
    [NotMapped]
    public string ParticipantFirstName
    {
        get
        {
            var parts = NameParts?.ToArray();
            return parts == null ? null
                : parts.Length == 1 ? parts[0]
                : string.Join(" ", parts.Take(parts.Length - 1));
        }
    }

    [Obsolete] [NotMapped] public string ParticipantLastName => NameParts?.LastOrDefault();

    // Who pays for it?
    public string CustomerName { get; set; }
    public string CustomerEmail { get; set; }
    public string CustomerAddress { get; set; }
    public string CustomerZip { get; set; }
    public string CustomerCity { get; set; }
    public string CustomerCountry { get; set; }
    public string CustomerVatNumber { get; set; }
    public string CustomerInvoiceReference { get; set; }

    public string Notes { get; set; }

    [Obsolete(
        "Use BusinessEventLog entity for tracking registration events. This property will be removed in a future version.")]
    public string Log { get; set; }

    public Instant? RegistrationTime { get; set; } = SystemClock.Instance.Now();

    public PaymentProvider PaymentMethod { get; set; } =
        PaymentProvider
            .PowerOfficeEmailInvoice; // FIXME: This ignores the actual default paymentmethod set in the database

    [Obsolete] public bool Verified { get; set; } = false;

    public int? CertificateId { get; set; }

    public string CertificateComment { get; set; }

    // Navigation properties
    public EventInfo EventInfo { get; set; }

    [JsonIgnore] public Certificate Certificate { get; set; }

    public ApplicationUser User { get; set; }

    public List<ExternalAccount> ExternalAccounts { get; set; }

    public List<ExternalRegistration> ExternalRegistrations { get; set; }

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

    [Obsolete(
        "Use BusinessEventLog entity for tracking registration events. This method will be removed in a future version.")]
    public void AddLog(string text = null)
    {
#pragma warning disable CS0618 // Type or member is obsolete
        var logText = $"{DateTime.UtcNow.ToString("u")}: ";
        if (!string.IsNullOrWhiteSpace(text))
        {
            logText += $"{text}";
        }
        else
        {
            logText += $"{Status}";
        }

        Log += logText + "\n";
#pragma warning restore CS0618 // Type or member is obsolete
    }
}
