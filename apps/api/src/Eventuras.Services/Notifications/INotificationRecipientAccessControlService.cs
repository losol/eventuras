using Eventuras.Domain;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.Notifications
{
    public interface INotificationRecipientAccessControlService
    {
        Task<IQueryable<NotificationRecipient>> AddAccessFilterAsync(
            IQueryable<NotificationRecipient> query,
            CancellationToken cancellationToken = default);
    }
}
