using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Events;

public interface IEventInfoRetrievalService
{
    /// <summary>
    ///     Gets event info by its ID. Performs current org check. If not a <see cref="Roles.SystemAdmin" /> then can only
    ///     access
    ///     events of the current org. If no current org, then only events without org can be accessed.
    /// </summary>
    /// <exception cref="Exceptions.NotFoundException">No event found.</exception>
    /// <exception cref="Exceptions.NotAccessibleException">Event is not accessible in the context of the current org.</exception>
    Task<EventInfo> GetEventInfoByIdAsync(int id,
        EventInfoRetrievalOptions options = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    ///     List all accessible events. <see cref="Roles.SuperAdmin" /> can see all events. Others may only see
    ///     events related to the current org, or events without org.
    /// </summary>
    Task<Paging<EventInfo>> ListEventsAsync(
        EventListRequest request,
        EventInfoRetrievalOptions options = null,
        CancellationToken cancellationToken = default);
}
