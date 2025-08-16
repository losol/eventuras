using System.Threading.Tasks;

namespace Eventuras.Services.Notifications;

public interface INotificationBackgroundService
{
    Task SendNotificationToRecipientAsync(int recipientId, bool accessControlDone);
}
