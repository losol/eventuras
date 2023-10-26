using Eventuras.Domain;
using System.Threading.Tasks;

namespace Eventuras.Services.Notifications
{
    public interface INotificationStatisticsService
    {
        Task UpdateNotificationStatisticsAsync(Notification notification);
    }
}
