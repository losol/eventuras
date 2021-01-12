using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.EventCollections
{
    public interface IEventCollectionManagementService
    {
        Task<EventCollection[]> ListCollectionsAsync();

        /// <exception cref="Exceptions.NotFoundException">Collection with the given id not found.</exception>
        Task<EventCollection> GetCollectionByIdAsync(int id);

        /// <exception cref="Exceptions.NotAccessibleException">Not permitted to create the given collection.</exception>
        Task CreateCollectionAsync(EventCollection collection);

        /// <exception cref="Exceptions.NotAccessibleException">Not permitted to update the given collection.</exception>
        Task UpdateCollectionAsync(EventCollection collection);

        /// <exception cref="Exceptions.NotAccessibleException">Not permitted to delete the given collection.</exception>
        Task DeleteCollectionAsync(EventCollection collection);
    }
}
