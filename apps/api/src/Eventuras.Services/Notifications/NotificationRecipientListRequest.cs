namespace Eventuras.Services.Notifications
{
    public class NotificationRecipientListRequest : PagingRequest
    {
        public NotificationRecipientFilter Filter { get; set; }

        public NotificationRecipientListOrder OrderBy { get; set; } = NotificationRecipientListOrder.Created;

        public bool Descending { get; set; }
    }
}
