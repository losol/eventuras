using Eventuras.Domain;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.Notifications
{
    public interface INotificationDeliveryService
    {
        Task SendNotificationAsync(
            Notification notification,
            CancellationToken cancellationToken = default);
    }
}
