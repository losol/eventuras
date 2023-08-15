namespace Eventuras.Services.Notifications;

public class NotificationListRequest : PagingRequest
{
    public NotificationFilter Filter { get; set; }

    public NotificationListOrder OrderBy { get; set; } = NotificationListOrder.Created;

    public bool Descending { get; set; }
}