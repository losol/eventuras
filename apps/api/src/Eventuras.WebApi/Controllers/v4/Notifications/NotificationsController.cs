using Asp.Versioning;
using Eventuras.Services.Notifications;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.WebApi.Controllers.v4.Notifications
{
    [ApiVersion("4-beta")]
    [Authorize]
    [Route("v{version:apiVersion}/notifications")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationRetrievalService _notificationRetrievalService;
        private readonly ILogger<NotificationsController> _logger;

        public NotificationsController(INotificationRetrievalService notificationRetrievalService, ILogger<NotificationsController> logger)
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
                    .GetNotificationByIdAsync(id, new NotificationRetrievalOptions
                    {
                        LoadStatistics = includeStatistics
                    }, cancellationToken: cancellationToken);

                return Ok(new NotificationDto(notification));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to retrieve notification with ID {id}: {ex.Message}");
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
                        new NotificationRetrievalOptions
                        {
                            LoadStatistics = query.IncludeStatistics
                        },
                        cancellationToken);

                return Ok(PageResponseDto<NotificationDto>.FromPaging(
                    query, paging, n => new NotificationDto(n)));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to list notifications: {ex.Message}");
                throw;
            }
        }
    }
}
