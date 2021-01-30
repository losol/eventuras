using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.EventCollections
{
    public interface IEventCollectionManagementService
    {
        Task<EventCollection[]> ListCollectionsAsync(CancellationToken cancellationToken = default);

        /// <exception cref="Exceptions.NotFoundException">Collection with the given id not found.</exception>
        Task<EventCollection> GetCollectionByIdAsync(int id, CancellationToken cancellationToken = default);

        /// <exception cref="Exceptions.NotAccessibleException">Not permitted to create the given collection.</exception>
        Task CreateCollectionAsync(EventCollection collection, CancellationToken cancellationToken = default);

        /// <exception cref="Exceptions.NotAccessibleException">Not permitted to update the given collection.</exception>
        Task UpdateCollectionAsync(EventCollection collection, CancellationToken cancellationToken = default);

        /// <exception cref="Exceptions.NotAccessibleException">Not permitted to delete the given collection.</exception>
        Task DeleteCollectionAsync(EventCollection collection, CancellationToken cancellationToken = default);
    }
}
