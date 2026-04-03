using System;
using Eventuras.Domain;

namespace Eventuras.Services.Notifications;

public class NotificationFilter
{
    public bool AccessibleOnly { get; set; }

    public int? EventId { get; set; }

    public int? ProductId { get; set; }

    public Guid? SenderUserId { get; set; }

    public Guid? RecipientUserId { get; set; }

    public NotificationStatus[] Statuses { get; set; }

    public NotificationType[] Types { get; set; }
}
