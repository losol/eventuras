using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Notifications;

public interface INotificationDeliveryService
{
    Task QueueNotificationAsync(
        Notification notification,
        bool accessControlDone = false,
        CancellationToken cancellationToken = default);
}
