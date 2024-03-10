using System.Threading.Tasks;

namespace Eventuras.Services.Notifications
{
    public interface INotificationBackgroundService
    {
        Task SendNotificationAsync(int notificationId, string recipientIdentifier, bool accessControlDone = false);
    }
}
