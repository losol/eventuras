using Eventuras.Domain;
using Eventuras.Services.Notifications;
using Eventuras.WebApi.Models;
using System.ComponentModel.DataAnnotations;

namespace Eventuras.WebApi.Controllers.Notifications
{
    public class NotificationsQueryDto : PageQueryDto
    {
        [Range(1, int.MaxValue)] public int? EventId { get; set; }

        [Range(1, int.MaxValue)] public int? ProductId { get; set; }

        public NotificationStatus? Status { get; set; }

        public NotificationType? Type { get; set; }

        public string RecipientUserId { get; set; }

        public NotificationListOrder Order { get; set; } = NotificationListOrder.Created;

        public bool Desc { get; set; } = true;

        /// <summary>
        /// Whether to include delivery statistics into response.
        /// </summary>
        public bool IncludeStatistics { get; set; }
    }
}
