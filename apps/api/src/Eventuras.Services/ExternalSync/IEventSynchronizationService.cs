using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.ExternalSync;

public interface IEventSynchronizationService
{
    string[] SyncProviderNames { get; }

    /// <summary>
    ///     Syncs users between event management and external event service.
    ///     Non-existing users are created in the external service.
    ///     All users are registered to the external event associated with the given event.
    /// </summary>
    /// <returns>Synchronization results for each external sync provider</returns>
    Task<EventSynchronizationResult[]> SyncEvent(
        int eventId,
        string syncProviderName = null,
        CancellationToken cancellationToken = default);
}
