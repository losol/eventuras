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
    private readonly IBusinessEventAccessControlService _accessControl;
    private readonly ApplicationDbContext _dbContext;

    public BusinessEventService(
        ApplicationDbContext dbContext,
        IBusinessEventAccessControlService accessControl)
    {
        ArgumentNullException.ThrowIfNull(dbContext);
        ArgumentNullException.ThrowIfNull(accessControl);

        _dbContext = dbContext;
        _accessControl = accessControl;
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

        await _accessControl.CheckListAccessAsync(organizationUuid, cancellationToken);

        var query = _dbContext.BusinessEvents
            .AsNoTracking()
            .Where(e =>
                e.OrganizationUuid == organizationUuid &&
                e.SubjectType == subject.Type &&
                e.SubjectUuid == subject.Uuid);

        return await Paging.CreateAsync(NewestFirst(query), request, cancellationToken);
    }

    public async Task<Paging<BusinessEvent>> ListEventsForEventAsync(
        Guid organizationUuid,
        Guid eventInfoUuid,
        PagingRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        await _accessControl.CheckListAccessAsync(organizationUuid, cancellationToken);

        // Subjects that belong to the event, resolved as subqueries (IN (...)) so the
        // audit table needs no event column of its own.
        var registrationUuids = _dbContext.Registrations
            .Where(r => r.EventInfo.Uuid == eventInfoUuid)
            .Select(r => r.Uuid);
        var orderUuids = _dbContext.Orders
            .Where(o => o.Registration.EventInfo.Uuid == eventInfoUuid)
            .Select(o => o.Uuid);

        var query = _dbContext.BusinessEvents
            .AsNoTracking()
            .Where(e =>
                e.OrganizationUuid == organizationUuid &&
                ((e.SubjectType == BusinessEventSubjects.EventType && e.SubjectUuid == eventInfoUuid) ||
                 (e.SubjectType == BusinessEventSubjects.RegistrationType && registrationUuids.Contains(e.SubjectUuid)) ||
                 (e.SubjectType == BusinessEventSubjects.OrderType && orderUuids.Contains(e.SubjectUuid))));

        return await Paging.CreateAsync(NewestFirst(query), request, cancellationToken);
    }

    private static IOrderedQueryable<BusinessEvent> NewestFirst(IQueryable<BusinessEvent> query) =>
        query
            .OrderByDescending(e => e.CreatedAt)
            .ThenByDescending(e => e.Uuid);
}
