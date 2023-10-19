using Eventuras.Domain;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.EventCollections
{
    public interface IEventCollectionRetrievalService
    {
        Task<EventCollection[]> ListCollectionsAsync(
            EventCollectionListRequest request = null,
            EventCollectionRetrievalOptions options = null,
            CancellationToken cancellationToken = default);

        /// <exception cref="Exceptions.NotFoundException">Collection with the given id not found.</exception>
        Task<EventCollection> GetCollectionByIdAsync(int id,
            EventCollectionRetrievalOptions options = null,
            CancellationToken cancellationToken = default);
    }
}
