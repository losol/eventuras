using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Events;

public interface IEventManagementService
{
    Task CreateNewEventAsync(EventInfo info);

    Task UpdateEventAsync(EventInfo info);

    Task DeleteEventAsync(int id);
}
