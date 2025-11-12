using System.Text.Json.Serialization;
using Eventuras.Domain;
using NodaTime;

namespace Eventuras.WebApi.Controllers.v3.Notifications;

public class NotificationDto
{
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

    public int NotificationId { get; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public int? OrganizationId { get; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public int? EventId { get; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public int? ProductId { get; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public int? RegistrationId { get; }

    public string Message { get; }

    public Instant Created { get; }

    public Instant StatusUpdated { get; }

    public NotificationType Type { get; }

    public NotificationStatus Status { get; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public NotificationStatisticsDto Statistics { get; }
}

public class NotificationStatisticsDto
{
    public NotificationStatisticsDto(NotificationStatistics stats)
    {
        Sent = stats.SentTotal;
        Errors = stats.ErrorsTotal;
        Recipients = stats.RecipientsTotal;
    }

    public int Sent { get; }

    public int Errors { get; }

    public int Recipients { get; }
}
