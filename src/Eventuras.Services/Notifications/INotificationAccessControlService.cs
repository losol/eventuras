using Eventuras.Domain;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.Notifications
{
    public interface INotificationAccessControlService
    {
        Task CheckNotificationReadAccessAsync(Notification notification,
            CancellationToken cancellationToken = default);

        Task CheckNotificationUpdateAccessAsync(Notification notification,
            CancellationToken cancellationToken = default);

        Task<IQueryable<Notification>> AddAccessFilterAsync(IQueryable<Notification> query,
            CancellationToken cancellationToken = default);
    }
}
