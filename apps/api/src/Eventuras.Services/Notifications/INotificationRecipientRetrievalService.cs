using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Notifications;

public interface INotificationRecipientRetrievalService
{
    Task<NotificationRecipient> GetNotificationRecipientByIdAsync(
        int recipientId,
        bool accessControlDone = false,
        CancellationToken cancellationToken = default);

    /// <exception cref="Eventuras.Services.Exceptions.NotAccessibleException">Cannot list notification</exception>
    Task<Paging<NotificationRecipient>> ListNotificationRecipientsAsync(
        NotificationRecipientListRequest request,
        NotificationRecipientRetrievalOptions options = default,
        CancellationToken cancellationToken = default);
}
