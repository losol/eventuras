using Eventuras.Domain;

namespace Eventuras.Services.Notifications
{
    public class NotificationFilter
    {
        public bool AccessibleOnly { get; set; }

        public int? EventId { get; set; }

        public int? ProductId { get; set; }

        public string SenderUserId { get; set; }

        public string RecipientUserId { get; set; }

        public NotificationStatus[] Statuses { get; set; }

        public NotificationType[] Types { get; set; }
    }
}
