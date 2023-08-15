using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Notifications;

public interface INotificationStatisticsService
{
    Task UpdateNotificationStatisticsAsync(Notification notification);
}