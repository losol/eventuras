using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Notifications;

public interface INotificationRetrievalService
{
    /// <exception cref="Exceptions.NotFoundException">Notification not found by its id</exception>
    /// <exception cref="Exceptions.NotAccessibleException">Cannot access notification by id</exception>
    Task<Notification> GetNotificationByIdAsync(int id,
        NotificationRetrievalOptions options = default,
        bool accessControlDone = false,
        CancellationToken cancellationToken = default);

    /// <exception cref="Eventuras.Services.Exceptions.NotAccessibleException">Cannot list notification</exception>
    Task<Paging<Notification>> ListNotificationsAsync(
        NotificationListRequest request,
        NotificationRetrievalOptions options = default,
        CancellationToken cancellationToken = default);
}
