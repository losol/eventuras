using Eventuras.Domain;
using System.Threading.Tasks;

namespace Eventuras.Services.Events
{
    public interface IEventManagementService
    {
        Task CreateNewEventAsync(EventInfo info);

        Task UpdateEventAsync(EventInfo info);

        Task DeleteEventAsync(int id);
    }
}
