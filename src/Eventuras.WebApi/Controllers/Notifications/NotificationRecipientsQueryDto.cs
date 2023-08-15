using Eventuras.Services.Notifications;
using Eventuras.WebApi.Models;

namespace Eventuras.WebApi.Controllers.Notifications;

public class NotificationRecipientsQueryDto : PageQueryDto
{
    public string Query { get; set; }

    public bool SentOnly { get; set; }

    public bool ErrorsOnly { get; set; }

    public NotificationRecipientListOrder Order { get; set; } = NotificationRecipientListOrder.Created;

    public bool Desc { get; set; } = true;
}