using System;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Services.Notifications;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Eventuras.WebApi.Controllers.v3.Notifications;

[ApiVersion("3")]
[Authorize]
[Route("v{version:apiVersion}/notifications")]
[ApiController]
public class NotificationsController : ControllerBase
{
    private readonly ILogger<NotificationsController> _logger;
    private readonly INotificationRetrievalService _notificationRetrievalService;

    public NotificationsController(INotificationRetrievalService notificationRetrievalService,
        ILogger<NotificationsController> logger)
    {
        _notificationRetrievalService = notificationRetrievalService ?? throw
            new ArgumentNullException(nameof(notificationRetrievalService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(
        int id,
        [FromQuery] bool includeStatistics = false,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = await _notificationRetrievalService
                .GetNotificationByIdAsync(id, new NotificationRetrievalOptions { LoadStatistics = includeStatistics },
                    cancellationToken: cancellationToken);

            return Ok(new NotificationDto(notification));
        }
        catch (Exception ex)
        {
            _logger.LogError("Failed to retrieve notification with ID {id}: {ExceptionMessage}", id, ex.Message);
            throw;
        }
    }

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] NotificationsQueryDto query,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid request for notifications.");
            return BadRequest(ModelState.FormatErrors());
        }

        try
        {
            var paging = await _notificationRetrievalService
                .ListNotificationsAsync(
                    new NotificationListRequest
                    {
                        Limit = query.Limit,
                        Offset = query.Offset,
                        Filter = new NotificationFilter
                        {
                            AccessibleOnly = true,
                            EventId = query.EventId,
                            ProductId = query.ProductId,
                            RecipientUserId = query.RecipientUserId,
                            Statuses = query.Status.HasValue
                                ? new[] { query.Status.Value }
                                : null,
                            Types = query.Type.HasValue
                                ? new[] { query.Type.Value }
                                : null
                        },
                        OrderBy = query.Order,
                        Descending = query.Desc
                    },
                    new NotificationRetrievalOptions { LoadStatistics = query.IncludeStatistics },
                    cancellationToken);

            return Ok(PageResponseDto<NotificationDto>.FromPaging(
                query, paging, n => new NotificationDto(n)));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to list notifications: {ExceptionMessage}", ex.Message);
            throw;
        }
    }
}
