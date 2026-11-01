#nullable enable

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

using Eventuras.Domain;

namespace Eventuras.Services.BusinessEvents;

public interface IBusinessEventService
{
    void AddEvent(
        BusinessEventSubject subject,
        string eventType,
        string message,
        Guid? organizationUuid = null,
        Guid? actorUserUuid = null,
        object? metadata = null);

    Task<Paging<BusinessEvent>> ListEventsAsync(
        Guid organizationUuid,
        BusinessEventSubject subject,
        PagingRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    ///     Every event recorded on an EventInfo, across subjects: the event itself, its
    ///     registrations and their orders. Resolved from the domain tables, so nothing
    ///     extra is stored on the records. Newest first.
    /// </summary>
    /// <summary>
    ///     Looks up display names for the events' subjects and actors at read time,
    ///     so the audit log itself stores no personal data.
    /// </summary>
    Task<BusinessEventNames> ResolveNamesAsync(
        IReadOnlyCollection<BusinessEvent> events,
        CancellationToken cancellationToken = default);

    Task<Paging<BusinessEvent>> ListEventsForEventAsync(
        Guid organizationUuid,
        Guid eventInfoUuid,
        PagingRequest request,
        CancellationToken cancellationToken = default);
}

/// <summary>Display name and legacy int id (for admin links) of a business event subject.</summary>
public sealed record BusinessEventSubjectInfo(string? Name, int? Id);

public sealed record BusinessEventNames(
    IReadOnlyDictionary<Guid, BusinessEventSubjectInfo> Subjects,
    IReadOnlyDictionary<Guid, string> Actors)
{
    public static readonly BusinessEventNames Empty = new(
        new Dictionary<Guid, BusinessEventSubjectInfo>(),
        new Dictionary<Guid, string>());
}
