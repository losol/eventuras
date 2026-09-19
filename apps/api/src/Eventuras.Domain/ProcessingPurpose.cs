using System;
using System.ComponentModel.DataAnnotations;

using NodaTime;

#nullable enable

namespace Eventuras.Domain;

// A purpose an organization processes personal data for, as it was shown to the user.
// Immutable after publication: a text change means a new row with Version + 1.
public class ProcessingPurpose
{
    [Key]
    public Guid Uuid { get; init; } = Guid.CreateVersion7();

    public Guid OrganizationUuid { get; init; }

    [Required]
    [MaxLength(100)]
    public string Code { get; init; } = string.Empty;

    public int Version { get; init; }

    public PurposeKind Kind { get; init; }

    [Required]
    [MaxLength(200)]
    public string Name { get; init; } = string.Empty;

    [Required]
    public string Text { get; init; } = string.Empty;

    // Material change from the previous version: earlier OptIn decisions no longer count.
    public bool RequiresReconsent { get; init; }

    // The purpose covers a special category of personal data (GDPR article 9,
    // e.g. dietary requirements, which reveal health). Such a purpose can only be
    // OptIn — a reservation is not a valid basis for article 9 data — which a
    // check constraint enforces. Callers are expected to require an explicit
    // affirmative action rather than inferring consent from a filled-in field.
    public bool HasSpecialCategoryData { get; init; }

    public Instant CreatedAt { get; init; } = SystemClock.Instance.GetCurrentInstant();

    public Instant? RetiredAt { get; set; }

    public enum PurposeKind
    {
        // Consent: denied unless the user has said yes.
        OptIn = 1,

        // Reservation: allowed unless the user has said no.
        OptOut = 2,
    }
}
