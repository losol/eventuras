using Eventuras.Domain;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.EventCollections
{
    public interface IEventCollectionManagementService
    {
        /// <exception cref="Exceptions.NotAccessibleException">Not permitted to create the given collection.</exception>
        Task CreateCollectionAsync(EventCollection collection, CancellationToken cancellationToken = default);

        /// <exception cref="Exceptions.NotAccessibleException">Not permitted to update the given collection.</exception>
        Task UpdateCollectionAsync(EventCollection collection, CancellationToken cancellationToken = default);

        /// <exception cref="Exceptions.NotAccessibleException">Not permitted to delete the given collection.</exception>
        Task ArchiveCollectionAsync(EventCollection collection, CancellationToken cancellationToken = default);
    }
}
