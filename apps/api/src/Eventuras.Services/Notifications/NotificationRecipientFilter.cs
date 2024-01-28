namespace Eventuras.Services.Notifications
{
    public class NotificationRecipientFilter
    {
        public bool AccessibleOnly { get; set; }

        public string Query { get; set; }

        public int[] NotificationIds { get; set; }

        public bool SentOnly { get; set; }

        public bool ErrorsOnly { get; set; }
    }
}
