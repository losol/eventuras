#nullable enable

using System;
using System.Collections.Generic;
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

    public async Task<BusinessEventNames> ResolveNamesAsync(
        IReadOnlyCollection<BusinessEvent> events,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(events);
        if (events.Count == 0)
        {
            return BusinessEventNames.Empty;
        }

        Guid[] UuidsOf(string type) =>
            events.Where(e => e.SubjectType == type).Select(e => e.SubjectUuid).Distinct().ToArray();

        var subjects = new Dictionary<Guid, BusinessEventSubjectInfo>();

        var registrationUuids = UuidsOf(BusinessEventSubjects.RegistrationType);
        if (registrationUuids.Length > 0)
        {
            var rows = await _dbContext.Registrations.AsNoTracking()
                .Where(r => registrationUuids.Contains(r.Uuid))
                .Select(r => new
                {
                    r.Uuid,
                    r.RegistrationId,
                    r.ParticipantName,
                    r.User.GivenName,
                    r.User.MiddleName,
                    r.User.FamilyName,
                })
                .ToListAsync(cancellationToken);
            foreach (var r in rows)
            {
                var name = FullName(r.GivenName, r.MiddleName, r.FamilyName) ?? NullIfBlank(r.ParticipantName);
                subjects[r.Uuid] = new BusinessEventSubjectInfo(name, r.RegistrationId);
            }
        }

        var orderUuids = UuidsOf(BusinessEventSubjects.OrderType);
        if (orderUuids.Length > 0)
        {
            var rows = await _dbContext.Orders.AsNoTracking()
                .Where(o => orderUuids.Contains(o.Uuid))
                .Select(o => new { o.Uuid, o.OrderId, o.User.GivenName, o.User.MiddleName, o.User.FamilyName })
                .ToListAsync(cancellationToken);
            foreach (var o in rows)
            {
                var customer = FullName(o.GivenName, o.MiddleName, o.FamilyName);
                var name = customer is null ? $"#{o.OrderId}" : $"#{o.OrderId} – {customer}";
                subjects[o.Uuid] = new BusinessEventSubjectInfo(name, o.OrderId);
            }
        }

        var eventUuids = UuidsOf(BusinessEventSubjects.EventType);
        if (eventUuids.Length > 0)
        {
            var rows = await _dbContext.EventInfos.AsNoTracking()
                .Where(e => eventUuids.Contains(e.Uuid))
                .Select(e => new { e.Uuid, e.EventInfoId, e.Title })
                .ToListAsync(cancellationToken);
            foreach (var e in rows)
            {
                subjects[e.Uuid] = new BusinessEventSubjectInfo(NullIfBlank(e.Title), e.EventInfoId);
            }
        }

        var userSubjectUuids = UuidsOf(BusinessEventSubjects.UserType);
        var actorUuids = events.Where(e => e.ActorUserUuid.HasValue).Select(e => e.ActorUserUuid!.Value);
        var userIds = userSubjectUuids.Concat(actorUuids).Distinct().ToArray();
        var userNames = new Dictionary<Guid, string>();
        if (userIds.Length > 0)
        {
            var rows = await _dbContext.Users.AsNoTracking()
                .Where(u => userIds.Contains(u.Id))
                .Select(u => new { u.Id, u.GivenName, u.MiddleName, u.FamilyName })
                .ToListAsync(cancellationToken);
            foreach (var u in rows)
            {
                if (FullName(u.GivenName, u.MiddleName, u.FamilyName) is { } name)
                {
                    userNames[u.Id] = name;
                }
            }
        }

        foreach (var uuid in userSubjectUuids)
        {
            subjects[uuid] = new BusinessEventSubjectInfo(userNames.GetValueOrDefault(uuid), null);
        }

        return new BusinessEventNames(subjects, userNames);
    }

    // Same composition as ApplicationUser.Name, which EF can't translate.
    private static string? FullName(string? given, string? middle, string? family) =>
        NullIfBlank($"{given} {(string.IsNullOrEmpty(middle) ? "" : middle + " ")}{family}");

    private static string? NullIfBlank(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static IOrderedQueryable<BusinessEvent> NewestFirst(IQueryable<BusinessEvent> query) =>
        query
            .OrderByDescending(e => e.CreatedAt)
            .ThenByDescending(e => e.Uuid);
}
