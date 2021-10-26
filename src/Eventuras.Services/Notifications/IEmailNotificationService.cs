using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Notifications
{
    public interface IEmailNotificationService
    {
        Task SendEmailNotificationAsync(
            EmailNotification notification,
            CancellationToken cancellationToken = default);
    }
}
