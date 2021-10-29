using System;
using Eventuras.Domain;
using Newtonsoft.Json;

namespace Eventuras.WebApi.Controllers.Notifications
{
    public class NotificationDto
    {
        public int NotificationId { get; }

        public int? OrganizationId { get; }

        public int? EventInfoId { get; }

        public int? ProductId { get; }

        public string CreatedByUserId { get; }

        public string Message { get; }

        public DateTime Created { get; }

        public DateTime StatusUpdated { get; }

        public NotificationType Type { get; }

        public NotificationStatus Status { get; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public NotificationStatisticsDto Statistics { get; }

        public NotificationDto(Notification notification)
        {
            NotificationId = notification.NotificationId;
            OrganizationId = notification.OrganizationId;
            EventInfoId = notification.EventInfoId;
            ProductId = notification.ProductId;
            CreatedByUserId = notification.CreatedByUserId;
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

        public NotificationStatisticsDto(NotificationStatistics stats)
        {
            Sent = stats.SentTotal;
            Errors = stats.ErrorsTotal;
        }
    }
}
