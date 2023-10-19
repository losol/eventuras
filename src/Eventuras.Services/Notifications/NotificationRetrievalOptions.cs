namespace Eventuras.Services.Notifications
{
    public class NotificationRetrievalOptions
    {
        public bool ForUpdate { get; set; }

        public bool LoadOrganization { get; set; }

        public bool LoadEvent { get; set; }

        public bool LoadProduct { get; set; }

        public bool LoadSender { get; set; }

        public bool LoadRecipients { get; set; }

        public bool LoadStatistics { get; set; }
    }
}
