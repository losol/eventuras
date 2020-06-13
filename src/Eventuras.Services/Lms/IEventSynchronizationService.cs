using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.Lms
{
    public interface IEventSynchronizationService
    {
        /// <summary>
        /// Syncs users between event management and LMS provider.
        /// Non-existing users are created in LMS. All users are enrolled
        /// to the LMS course associated with the given event.
        /// </summary>
        /// <returns>Synchronization result</returns>
        Task<EventSynchronizationResult> SyncEvent(int eventId, CancellationToken cancellationToken = default);
    }
}
