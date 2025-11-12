#nullable enable

using System;
using Eventuras.Domain;

namespace Eventuras.Services.Registrations;

public class RegistrationFilter
{
    public int? EventInfoId { get; set; }

    public int? CertificateId { get; set; }

    public int[] ProductIds { get; set; } = Array.Empty<int>();

    public string? UserId { get; set; }

    public bool VerifiedOnly { get; set; }

    public bool ActiveUsersOnly { get; set; }

    public bool HavingEmailConfirmedOnly { get; set; }

    public bool AccessibleOnly { get; set; }

    public bool HavingCertificateOnly { get; set; }

    public bool HavingNoCertificateOnly { get; set; }

    public Registration.RegistrationStatus[] HavingStatuses { get; set; } =
        Array.Empty<Registration.RegistrationStatus>();

    public Registration.RegistrationType[] HavingTypes { get; set; } = Array.Empty<Registration.RegistrationType>();
}
