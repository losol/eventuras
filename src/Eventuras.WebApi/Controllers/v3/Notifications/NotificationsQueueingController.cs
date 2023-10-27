using Asp.Versioning;
using Eventuras.Domain;
using Eventuras.Services.Events.Products;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.WebApi.Controllers.v3.Notifications
{
    [ApiController]
    [ApiVersion("3")]
    [Authorize(Policy = Constants.Auth.AdministratorRole)]
    [Route("v{version:apiVersion}/notifications")]
    public class NotificationsQueueingController : ControllerBase
    {
        private readonly INotificationManagementService _notificationManagementService;
        private readonly INotificationDeliveryService _notificationDeliveryService;
        private readonly IProductRetrievalService _productRetrievalService;
        private readonly ILogger<NotificationsQueueingController> _logger;

        public NotificationsQueueingController(
            INotificationManagementService notificationManagementService,
            INotificationDeliveryService notificationDeliveryService,
            IProductRetrievalService productRetrievalService,
            ILogger<NotificationsQueueingController> logger)
        {
            _notificationDeliveryService = notificationDeliveryService ?? throw new ArgumentNullException(nameof(notificationDeliveryService));
            _notificationManagementService = notificationManagementService ?? throw new ArgumentNullException(nameof(notificationManagementService));
            _productRetrievalService = productRetrievalService ?? throw new ArgumentNullException(nameof(productRetrievalService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpPost("email")]
        public async Task<ActionResult<NotificationDto>> SendEmail(
      EmailNotificationDto dto,
      CancellationToken cancellationToken)
        {
            _logger.LogInformation($"Starting to process email notification. Subject: {dto.Subject}, Number of Recipients: {dto.Recipients?.Length ?? 0}");

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
            }
            else
            {
                emailNotification = await _notificationManagementService
                    .CreateEmailNotificationAsync(
                        dto.Subject,
                        dto.BodyMarkdown,
                        dto.Recipients);
            }

            // send notification right away, not queueing it or something.
            // TODO: use queue for messages

            await _notificationDeliveryService
                .SendNotificationAsync(emailNotification, cancellationToken);

            return Ok(new NotificationDto(emailNotification));
        }

        [HttpPost("sms")]
        public async Task<ActionResult<NotificationDto>> SendSms(
             SmsNotificationDto dto,
             CancellationToken cancellationToken)
        {
            _logger.LogInformation($"Starting to process SMS notification. Message: {dto.Message}, Number of Recipients: {dto.Recipients?.Length ?? 0}");

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

            // send notification right away, not queueing it or something.
            // TODO: use queue for messages

            await _notificationDeliveryService
                .SendNotificationAsync(smsNotification, cancellationToken);

            return Ok(new NotificationDto(smsNotification));
        }

        private async Task<EventParticipantsFilterDto> GetEventParticipantFilterAsync(
            INotificationDto dto,
            CancellationToken cancellationToken = default)
        {
            var eventFilter = dto.EventParticipants;
            var eventFilterSet = eventFilter?.IsDefined == true;

            if (dto.Recipients?.Any() != true && !eventFilterSet)
            {
                _logger.LogWarning("Either recipient list of event participant filter must be specified");
                throw new InputException("Either recipient list of event participant filter must be specified");
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
    }

    public class EmailNotificationDto : INotificationDto
    {
        [EmailRecipientList] public string[] Recipients { get; set; }

        public EventParticipantsFilterDto EventParticipants { get; set; }

        [Required][MinLength(3)] public string Subject { get; set; }

        [Required][MinLength(10)] public string BodyMarkdown { get; set; }
    }

    public class SmsNotificationDto : INotificationDto
    {
        [SmsRecipientList] public string[] Recipients { get; set; }

        public EventParticipantsFilterDto EventParticipants { get; set; }

        [Required][MinLength(10)] public string Message { get; set; }
    }
}
