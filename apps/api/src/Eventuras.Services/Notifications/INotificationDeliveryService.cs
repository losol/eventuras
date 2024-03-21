using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Notifications;

public interface INotificationDeliveryService
{
    Task SendNotificationAsync(
        Notification notification,
        bool ignoreAccessControl = false,
        CancellationToken cancellationToken = default);
}
