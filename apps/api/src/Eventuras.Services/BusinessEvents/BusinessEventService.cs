#nullable enable

using System;
using System.Text.Json;

using Eventuras.Domain;
using Eventuras.Infrastructure;

namespace Eventuras.Services.BusinessEvents;

public class BusinessEventService : IBusinessEventService
{
    private readonly ApplicationDbContext _dbContext;

    public BusinessEventService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public void AddEvent(
        BusinessEventSubject subject,
        string eventType,
        string message,
        Guid? actorUserUuid = null,
        object? metadata = null)
    {
        ArgumentNullException.ThrowIfNull(subject);
        ArgumentException.ThrowIfNullOrWhiteSpace(eventType);
        ArgumentException.ThrowIfNullOrWhiteSpace(message);

        var entity = new BusinessEvent
        {
            EventType = eventType,
            Message = message,
            SubjectType = subject.Type,
            SubjectUuid = subject.Uuid,
            ActorUserUuid = actorUserUuid,
            MetadataJson = metadata is null
                ? null
                : JsonSerializer.Serialize(metadata)
        };

        _dbContext.BusinessEvents.Add(entity);
    }
}
