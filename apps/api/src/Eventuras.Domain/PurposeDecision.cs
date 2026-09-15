using System;
using System.ComponentModel.DataAnnotations;

using NodaTime;

#nullable enable

namespace Eventuras.Domain;

// The user's current decision on a purpose; change history goes to BusinessEvent.
public class PurposeDecision
{
    [Key]
    public Guid Uuid { get; init; } = Guid.CreateVersion7();

    public Guid UserId { get; init; }

    public Guid OrganizationUuid { get; init; }

    [Required]
    [MaxLength(100)]
    public string Code { get; init; } = string.Empty;

    // The exact purpose version the user decided on. A composite FK keeps
    // OrganizationUuid and Code in sync with it.
    public Guid ProcessingPurposeUuid { get; set; }

    public DecisionValue Decision { get; set; }

    [MaxLength(50)]
    public string? Source { get; set; }

    public Instant CreatedAt { get; init; } = SystemClock.Instance.GetCurrentInstant();

    // When the user last decided; the service sets it on every change.
    public Instant DecidedAt { get; set; } = SystemClock.Instance.GetCurrentInstant();

    public enum DecisionValue
    {
        // OptIn: consented. OptOut: explicitly fine with it (reservation lifted).
        Allowed = 1,

        // OptIn: declined or withdrawn. OptOut: reserved against it.
        Denied = 2,
    }
}
