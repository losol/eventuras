#nullable enable

using System;
using System.Text.Json;
using Eventuras.Domain;
using NodaTime;

namespace Eventuras.WebApi.Controllers.v3.BusinessEvents;

public class BusinessEventDto
{
    public BusinessEventDto() { }

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

    public Guid? OrganizationUuid { get; set; }

    public Guid? ActorUserUuid { get; set; }

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
