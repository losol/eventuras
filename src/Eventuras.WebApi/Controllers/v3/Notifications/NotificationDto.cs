using Eventuras.Domain;
using Newtonsoft.Json;
using NodaTime;

namespace Eventuras.WebApi.Controllers.Notifications
{
    public class NotificationDto
    {
        public int NotificationId { get; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public int? OrganizationId { get; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public int? EventId { get; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public int? ProductId { get; }

        public string Message { get; }

        public Instant Created { get; }

        public Instant StatusUpdated { get; }

        public NotificationType Type { get; }

        public NotificationStatus Status { get; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public NotificationStatisticsDto Statistics { get; }

        public NotificationDto(Notification notification)
        {
            NotificationId = notification.NotificationId;
            OrganizationId = notification.OrganizationId;
            EventId = notification.EventInfoId;
            ProductId = notification.ProductId;
            Message = notification.Message;
            Created = notification.Created;
            StatusUpdated = notification.StatusUpdated;
            Type = notification.Type;
            Status = notification.Status;
            Statistics = notification.Statistics != null
                ? new NotificationStatisticsDto(notification.Statistics)
                : null;
        }
    }

    public class NotificationStatisticsDto
    {
        public int Sent { get; }

        public int Errors { get; }

        public int Recipients { get; }

        public NotificationStatisticsDto(NotificationStatistics stats)
        {
            Sent = stats.SentTotal;
            Errors = stats.ErrorsTotal;
            Recipients = stats.RecipientsTotal;
        }
    }
}
