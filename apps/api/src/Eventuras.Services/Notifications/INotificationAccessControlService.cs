using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Notifications;

public interface INotificationAccessControlService
{
    Task CheckNotificationReadAccessAsync(Notification notification,
        CancellationToken cancellationToken = default);

    /// <exception cref="Eventuras.Services.Exceptions.InvalidOperationException">Notifications null or empty</exception>
    Task CheckNotificationsReadAccessAsync(List<Notification> notifications,
        CancellationToken cancellationToken = default);

    Task CheckNotificationUpdateAccessAsync(Notification notification,
        CancellationToken cancellationToken = default);

    /// <exception cref="Eventuras.Services.Exceptions.InvalidOperationException">Notifications null or empty</exception>
    Task CheckNotificationsUpdateAccessAsync(List<Notification> notifications,
        CancellationToken cancellationToken = default);

    Task<IQueryable<Notification>> AddAccessFilterAsync(IQueryable<Notification> query,
        CancellationToken cancellationToken = default);
}
