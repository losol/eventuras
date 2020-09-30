using Eventuras.Domain;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Eventuras.Services.Events
{
    public interface IEventInfoRetrievalService
    {
        /// <summary>
        /// Gets event info by its ID. Performs current org check. If not a <see cref="Roles.SuperAdmin"/> then can only access
        /// events of the current org. If no current org, then only events without org can be accessed.
        /// </summary>
        /// <exception cref="System.InvalidOperationException">No event found or not accessible in the context of the current org.</exception>
        Task<EventInfo> GetEventInfoByIdAsync(int id, EventInfoRetrievalOptions options = null);

        /// <summary>
        /// List all accessible events. <see cref="Roles.SuperAdmin"/> can see all events. Others may only see
        /// events related to the current org, or events without org.
        /// </summary>
        Task<List<EventInfo>> ListEventsAsync(
            EventInfoFilter filter = null,
            EventRetrievalOrder order = EventRetrievalOrder.StartDate,
            EventInfoRetrievalOptions options = null);
    }
}
