using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.EventCollections;

public interface IEventCollectionAccessControlService
{
    /// <exception cref="Exceptions.NotAccessibleException">Event collection cannot be accessed for read.</exception>
    Task CheckEventCollectionReadAccessAsync(EventCollection collection,
        CancellationToken cancellationToken = default);

    /// <exception cref="Exceptions.NotAccessibleException">Event collection cannot be accessed for update.</exception>
    Task CheckEventCollectionUpdateAccessAsync(EventCollection collection,
        CancellationToken cancellationToken = default);

    Task<IQueryable<EventCollection>> AddAccessFilterAsync(IQueryable<EventCollection> query,
        CancellationToken cancellationToken = default);
}
