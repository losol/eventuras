#nullable enable

using System;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.EntityFrameworkCore;

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
        Guid? organizationUuid = null,
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
            OrganizationUuid = organizationUuid,
            ActorUserUuid = actorUserUuid,
            MetadataJson = metadata is null
                ? null
                : JsonSerializer.Serialize(metadata)
        };

        _dbContext.BusinessEvents.Add(entity);
    }

    public async Task<Paging<BusinessEvent>> ListEventsAsync(
        Guid organizationUuid,
        BusinessEventSubject subject,
        PagingRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(subject);
        ArgumentNullException.ThrowIfNull(request);

        var query = _dbContext.BusinessEvents
            .AsNoTracking()
            .Where(e =>
                e.OrganizationUuid == organizationUuid &&
                e.SubjectType == subject.Type &&
                e.SubjectUuid == subject.Uuid)
            .OrderByDescending(e => e.CreatedAt)
            .ThenByDescending(e => e.Uuid);

        return await Paging.CreateAsync(query, request, cancellationToken);
    }
}
