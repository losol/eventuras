#nullable enable

using System;
using System.Text.Json;
using Eventuras.Domain;
using Eventuras.Services.BusinessEvents;
using NodaTime;

namespace Eventuras.WebApi.Controllers.v3.BusinessEvents;

public class BusinessEventDto
{
    public BusinessEventDto() { }

    public BusinessEventDto(BusinessEvent entity, BusinessEventNames? names = null) : this(entity)
    {
        if (names is null)
        {
            return;
        }

        if (names.Subjects.TryGetValue(entity.SubjectUuid, out var subject))
        {
            SubjectName = subject.Name;
            SubjectId = subject.Id;
        }

        if (entity.ActorUserUuid is { } actor && names.Actors.TryGetValue(actor, out var actorName))
        {
            ActorName = actorName;
        }
    }

    public BusinessEventDto(BusinessEvent entity)
    {
        ArgumentNullException.ThrowIfNull(entity);

        Uuid = entity.Uuid;
        CreatedAt = entity.CreatedAt;
        EventType = entity.EventType;
        SubjectType = entity.SubjectType;
        SubjectUuid = entity.SubjectUuid;
        OrganizationUuid = entity.OrganizationUuid;
        ActorUserUuid = entity.ActorUserUuid;
        Message = entity.Message;
        Metadata = ParseMetadata(entity.MetadataJson);
    }

    public Guid Uuid { get; set; }

    public Instant CreatedAt { get; set; }

    public string EventType { get; set; } = string.Empty;

    public string SubjectType { get; set; } = string.Empty;

    public Guid SubjectUuid { get; set; }

    /// <summary>Display name of the subject, e.g. the participant. Null if unknown.</summary>
    public string? SubjectName { get; set; }

    /// <summary>Legacy int id of the subject, for admin links. Null for users or if unknown.</summary>
    public int? SubjectId { get; set; }

    public Guid? OrganizationUuid { get; set; }

    public Guid? ActorUserUuid { get; set; }

    /// <summary>Name of the user who made the change. Null for system changes or if unknown.</summary>
    public string? ActorName { get; set; }

    public string Message { get; set; } = string.Empty;

    /// <summary>
    ///     Parsed metadata. Rendered as a JSON object/array/primitive rather than
    ///     a JSON-encoded string. Null when the event has no metadata.
    /// </summary>
    public JsonElement? Metadata { get; set; }

    private static JsonElement? ParseMetadata(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return null;
        }

        // MetadataJson is written via JsonSerializer.Serialize in BusinessEventService.
        // If a row somehow contains malformed JSON, we fall through and return null
        // rather than fail the entire list response.
        try
        {
            using var doc = JsonDocument.Parse(json);
            return doc.RootElement.Clone();
        }
        catch (JsonException)
        {
            return null;
        }
    }
}
