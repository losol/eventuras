using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Notifications;

public interface INotificationRecipientAccessControlService
{
    Task<IQueryable<NotificationRecipient>> AddAccessFilterAsync(
        IQueryable<NotificationRecipient> query,
        CancellationToken cancellationToken = default);
}