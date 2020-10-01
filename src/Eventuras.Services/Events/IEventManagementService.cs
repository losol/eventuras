using Eventuras.Domain;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Eventuras.Services.Events
{
    public interface IEventManagementService
    {
        Task CreateNewEventAsync(EventInfo info);

        Task UpdateEventAsync(EventInfo info);

        Task UpdateEventProductsAsync(int eventId, List<Product> products);

        Task DeleteEventAsync(int id);
    }
}
