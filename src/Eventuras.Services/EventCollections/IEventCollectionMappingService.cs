using System.Threading.Tasks;

namespace Eventuras.Services.EventCollections
{
    public interface IEventCollectionMappingService
    {
        /// <exception cref="Exceptions.NotFoundException">Event or collection with the given id not found.</exception>
        /// <exception cref="Exceptions.NotAccessibleException">Not permitted to update the given event or collection.</exception>
        Task AddEventToCollectionAsync(int eventId, int collectionId);

        /// <exception cref="Exceptions.NotFoundException">Event or collection with the given id not found.</exception>
        /// <exception cref="Exceptions.NotAccessibleException">Not permitted to update the given event or collection.</exception>
        Task RemoveEventFromCollectionAsync(int eventId, int collectionId);
    }
}
