using System;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Services.Notifications;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.Notifications;

[ApiVersion("3")]
[Authorize]
[Route("v{version:apiVersion}/notifications")]
[ApiController]
public class NotificationsController : ControllerBase
{
    private readonly INotificationRetrievalService _notificationRetrievalService;

    public NotificationsController(INotificationRetrievalService notificationRetrievalService)
    {
        _notificationRetrievalService = notificationRetrievalService ?? throw new ArgumentNullException(nameof(notificationRetrievalService));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id, [FromQuery] bool includeStatistics = false, CancellationToken cancellationToken = default)
    {
        var notification = await _notificationRetrievalService.GetNotificationByIdAsync(id,
            new NotificationRetrievalOptions
            {
                LoadStatistics = includeStatistics,
            },
            cancellationToken);

        return Ok(new NotificationDto(notification));
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] NotificationsQueryDto query, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState.FormatErrors());

        var paging = await _notificationRetrievalService.ListNotificationsAsync(new NotificationListRequest
            {
                Limit = query.Limit,
                Offset = query.Offset,
                Filter = new NotificationFilter
                {
                    AccessibleOnly = true,
                    EventId = query.EventId,
                    ProductId = query.ProductId,
                    RecipientUserId = query.RecipientUserId,
                    Statuses = query.Status.HasValue ? new[] { query.Status.Value } : null,
                    Types = query.Type.HasValue ? new[] { query.Type.Value } : null,
                },
                OrderBy = query.Order,
                Descending = query.Desc,
            },
            new NotificationRetrievalOptions
            {
                LoadStatistics = query.IncludeStatistics,
            },
            cancellationToken);

        return Ok(PageResponseDto<NotificationDto>.FromPaging(query, paging, n => new NotificationDto(n)));
    }
}