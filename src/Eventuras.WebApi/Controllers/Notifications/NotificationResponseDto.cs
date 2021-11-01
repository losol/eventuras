using System;
using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.Notifications
{
    public class NotificationResponseDto
    {
        public int NotificationId { get; }

        public int TotalRecipients { get; }

        public NotificationResponseDto(Notification notification)
        {
            if (notification == null)
            {
                throw new ArgumentNullException(nameof(notification));
            }

            NotificationId = notification.NotificationId;
            TotalRecipients = notification.Recipients?.Count ?? 0;
        }
    }
}
