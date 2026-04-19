using System;
using System.ComponentModel.DataAnnotations;

using NodaTime;

#nullable enable

namespace Eventuras.Domain;

public class BusinessEvent
{
    [Key]
    public Guid Uuid { get; set; } = Guid.CreateVersion7();

    public Guid? OrganizationUuid { get; set; }

    public Instant CreatedAt { get; set; } = SystemClock.Instance.GetCurrentInstant();

    [Required]
    public string EventType { get; set; } = string.Empty;

    [Required]
    public string SubjectType { get; set; } = string.Empty;

    public Guid SubjectUuid { get; set; }

    public Guid? ActorUserUuid { get; set; }

    [Required]
    public string Message { get; set; } = string.Empty;

    public string? MetadataJson { get; set; }
}
