#nullable enable

using System;
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
}
