using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Domain;
using Eventuras.Services.Constants;
using Eventuras.Services.Events.Products;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Notifications;
using Eventuras.Services.Registrations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Eventuras.WebApi.Controllers.v3.Notifications;

[ApiController]
[ApiVersion("3")]
[Authorize(Policy = Constants.Auth.AdministratorRole)]
[Route("v{version:apiVersion}/notifications")]
public class NotificationsQueueingController : ControllerBase
{
    private readonly ILogger<NotificationsQueueingController> _logger;
    private readonly INotificationDeliveryService _notificationDeliveryService;
    private readonly INotificationManagementService _notificationManagementService;
    private readonly IProductRetrievalService _productRetrievalService;
    private readonly IRegistrationRetrievalService _registrationsRetrivalService;

    public NotificationsQueueingController(
        INotificationManagementService notificationManagementService,
        INotificationDeliveryService notificationDeliveryService,
        IProductRetrievalService productRetrievalService,
        IRegistrationRetrievalService registrationsRetrivalService,
        ILogger<NotificationsQueueingController> logger)
    {
        _notificationDeliveryService = notificationDeliveryService ??
                                       throw new ArgumentNullException(nameof(notificationDeliveryService));
        _notificationManagementService = notificationManagementService ??
                                         throw new ArgumentNullException(nameof(notificationManagementService));
        _productRetrievalService =
            productRetrievalService ?? throw new ArgumentNullException(nameof(productRetrievalService));
        _registrationsRetrivalService = registrationsRetrivalService ??
                                        throw new ArgumentNullException(nameof(registrationsRetrivalService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    [HttpPost("email")]
    public async Task<ActionResult<NotificationDto>> SendEmail(
        EmailNotificationDto dto,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            $"Starting to process email notification. Subject: {dto.Subject}, Number of Recipients: {dto.Recipients?.Length ?? 0}");
        _logger.LogInformation(JsonSerializer.Serialize(dto));

        var orgId = Request.Headers.TryGetValue(Api.OrganizationHeader, out var headerOrgId)
                    && int.TryParse(headerOrgId, out var parsedOrgId)
            ? parsedOrgId
            : (int?)null;

        if (orgId == null)
        {
            _logger.LogWarning("Organization ID is not set, cannot send email notification.");
            throw new InputException("Organization ID is not set, cannot send email notification.");
        }

        EmailNotification emailNotification;
        var eventFilter = await GetEventParticipantFilterAsync(dto, cancellationToken);
        if (eventFilter != null)
        {
            emailNotification = await _notificationManagementService
                .CreateEmailNotificationForEventAsync(
                    dto.Subject,
                    dto.BodyMarkdown,
                    eventFilter.EventId.Value,
                    eventFilter.RegistrationStatuses,
                    eventFilter.RegistrationTypes);
            await _notificationDeliveryService
                .SendNotificationAsync(emailNotification, cancellationToken: cancellationToken);
            return Ok(new NotificationDto(emailNotification));
        }

        if (dto.Recipients != null && dto.Recipients.Any())
        {
            emailNotification = await _notificationManagementService
                .CreateEmailNotificationAsync(
                    dto.Subject,
                    dto.BodyMarkdown,
                    orgId.Value,
                    dto.Recipients
                );
            await _notificationDeliveryService
                .SendNotificationAsync(emailNotification, cancellationToken: cancellationToken);

            return Ok(new NotificationDto(emailNotification));
        }

        if (dto.RegistrationId != null)
        {
            var registration = await _registrationsRetrivalService
                .GetRegistrationByIdAsync(dto.RegistrationId.Value, RegistrationRetrievalOptions.UserAndEvent,
                    cancellationToken);

            emailNotification = await _notificationManagementService
                .CreateEmailNotificationForRegistrationAsync(
                    dto.Subject,
                    dto.BodyMarkdown,
                    registration);
            await _notificationDeliveryService
                .SendNotificationAsync(emailNotification, cancellationToken: cancellationToken);

            return Ok(new NotificationDto(emailNotification));
        }

        if (dto.Recipients != null && dto.Recipients.Any())
        {
            emailNotification = await _notificationManagementService
                .CreateEmailNotificationAsync(
                    dto.Subject,
                    dto.BodyMarkdown,
                    orgId.Value,
                    dto.Recipients);
            await _notificationDeliveryService
                .SendNotificationAsync(emailNotification, cancellationToken: cancellationToken);

            return Ok(new NotificationDto(emailNotification));
        }

        return NoContent();
    }

    [HttpPost("sms")]
    public async Task<ActionResult<NotificationDto>> SendSms(
        SmsNotificationDto dto,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            $"Starting to process SMS notification. Message: {dto.Message}, Number of Recipients: {dto.Recipients?.Length ?? 0}");

        SmsNotification smsNotification;
        var eventFilter = await GetEventParticipantFilterAsync(dto, cancellationToken);
        if (eventFilter != null)
        {
            smsNotification = await _notificationManagementService
                .CreateSmsNotificationForEventAsync(
                    dto.Message,
                    eventFilter.EventId.Value,
                    eventFilter.RegistrationStatuses,
                    eventFilter.RegistrationTypes);
        }
        else
        {
            smsNotification = await _notificationManagementService
                .CreateSmsNotificationAsync(
                    dto.Message,
                    dto.Recipients);
        }


        await _notificationDeliveryService
            .SendNotificationAsync(smsNotification, cancellationToken: cancellationToken);

        return Ok();
    }

    private async Task<EventParticipantsFilterDto> GetEventParticipantFilterAsync(
        INotificationDto dto,
        CancellationToken cancellationToken = default)
    {
        var eventFilter = dto.EventParticipants;
        var eventFilterSet = eventFilter?.IsDefined == true;

        if (dto.Recipients?.Any() != true && !eventFilterSet && dto.RegistrationId == null)
        {
            _logger.LogWarning("Either registrationId, recipient list of event participant filter must be specified");
            throw new InputException("Either registrationId, eventId or recipient list  must be specified");
        }

        if (dto.Recipients?.Any() == true && eventFilterSet)
        {
            _logger.LogWarning("Please provider either of recipient list or event participants.");
            throw new InputException("Please provider either of recipient list or event participants.");
        }

        if (eventFilterSet)
        {
            _logger.LogInformation("Event filter is set, validating it.");
            if (eventFilter.ProductId.HasValue)
            {
                _logger.LogInformation($"Product filter is set, validating it. ProductId: {eventFilter.ProductId}");
                var product =
                    await _productRetrievalService
                        .GetProductByIdAsync(eventFilter.ProductId.Value,
                            cancellationToken: cancellationToken);
                if (eventFilter.EventId.HasValue)
                {
                    if (product.EventInfoId != eventFilter.EventId.Value)
                    {
                        throw new InputException(
                            $"Product {product.ProductId} doesn't belong to event {eventFilter.EventId}");
                    }
                }
                else
                {
                    eventFilter.EventId = product.EventInfoId;
                }
            }

            return eventFilter;
        }

        return null;
    }
}

public interface INotificationDto
{
    public string[] Recipients { get; set; }

    public EventParticipantsFilterDto EventParticipants { get; set; }

    public int? RegistrationId { get; set; }
}

public class EmailNotificationDto : INotificationDto
{
    [Required] [MinLength(3)] public string Subject { get; set; }

    [Required] [MinLength(10)] public string BodyMarkdown { get; set; }
    [EmailRecipientList] public string[] Recipients { get; set; }

    public EventParticipantsFilterDto EventParticipants { get; set; }
    public int? RegistrationId { get; set; }
}

public class SmsNotificationDto : INotificationDto
{
    [Required] [MinLength(10)] public string Message { get; set; }
    [SmsRecipientList] public string[] Recipients { get; set; }

    public EventParticipantsFilterDto EventParticipants { get; set; }

    public int? RegistrationId { get; set; }
}
