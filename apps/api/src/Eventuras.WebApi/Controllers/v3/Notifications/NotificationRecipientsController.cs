using System;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Services.Notifications;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.v3.Notifications;

[Authorize]
[ApiController]
[ApiVersion("3")]
[Route("v{version:apiVersion}/notifications/{id}/recipients")]
public class NotificationRecipientsController : ControllerBase
{
    private readonly INotificationRecipientRetrievalService _notificationRecipientRetrievalService;
    private readonly INotificationRetrievalService _notificationRetrievalService;

    public NotificationRecipientsController(
        INotificationRetrievalService notificationRetrievalService,
        INotificationRecipientRetrievalService notificationRecipientRetrievalService)
    {
        _notificationRetrievalService = notificationRetrievalService ?? throw
            new ArgumentNullException(nameof(notificationRetrievalService));

        _notificationRecipientRetrievalService = notificationRecipientRetrievalService ?? throw
            new ArgumentNullException(nameof(notificationRecipientRetrievalService));
    }

    [HttpGet]
    public async Task<IActionResult> List(int id,
        [FromQuery] NotificationRecipientsQueryDto request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState.FormatErrors());
        }

        await _notificationRetrievalService.GetNotificationByIdAsync(id,
            cancellationToken: cancellationToken); // for ensuring notification exists

        var paging = await _notificationRecipientRetrievalService
            .ListNotificationRecipientsAsync(
                new NotificationRecipientListRequest
                {
                    Limit = request.Limit,
                    Offset = request.Offset,
                    Filter = new NotificationRecipientFilter
                    {
                        AccessibleOnly = true,
                        NotificationIds = new[] { id },
                        Query = request.Query,
                        SentOnly = request.SentOnly,
                        ErrorsOnly = request.ErrorsOnly
                    },
                    OrderBy = request.Order,
                    Descending = request.Desc
                },
                new NotificationRecipientRetrievalOptions { LoadRegistration = true, LoadUser = true },
                cancellationToken);

        return Ok(PageResponseDto<NotificationRecipientDto>.FromPaging(
            request, paging, r => new NotificationRecipientDto(r)));
    }
}
