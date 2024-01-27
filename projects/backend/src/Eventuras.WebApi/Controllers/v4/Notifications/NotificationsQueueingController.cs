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
using static Eventuras.Domain.Registration;

namespace Eventuras.WebApi.Controllers.v4.Notifications
{
    [ApiController]
    [ApiVersion("4-beta")]
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
      EmailNotificationRequest dto,
      CancellationToken cancellationToken)
        {
            _logger.LogInformation($"Starting to process email notification. Subject: {dto.Content.Subject}, Number of Recipients: {dto.Recipients.EmailAddresses?.To.Length ?? 0}");

            EmailNotification emailNotification;
            var eventFilter = await GetHappeningParticipantFilterAsync(dto, cancellationToken);
            if (eventFilter != null)
            {
                emailNotification = await _notificationManagementService
                    .CreateEmailNotificationForEventAsync(
                        dto.Content.Subject,
                        dto.Content.Body,
                        eventFilter.EventId.Value,
                        eventFilter.RegistrationStatuses,
                        eventFilter.RegistrationTypes);
            }
            else
            {
                emailNotification = await _notificationManagementService
                    .CreateEmailNotificationAsync(
                        dto.Content.Subject,
                        dto.Content.Body,
                        dto.Recipients.EmailAddresses.To);
            }

            // send notification right away, not queueing it or something.
            // TODO: use queue for messages

            await _notificationDeliveryService
                .SendNotificationAsync(emailNotification, cancellationToken);

            return Ok(new NotificationDto(emailNotification));
        }

        [HttpPost("sms")]
        public async Task<ActionResult<NotificationDto>> SendSms(
             SmsNotificationRequest dto,
             CancellationToken cancellationToken)
        {
            _logger.LogInformation($"Starting to process SMS notification. Message: {dto.Content.Body}, Number of Recipients: {dto.Recipients?.PhoneNumbers.Length ?? 0}");

            SmsNotification smsNotification;
            var eventFilter = await GetHappeningParticipantFilterAsync(dto, cancellationToken);
            if (eventFilter != null)
            {
                smsNotification = await _notificationManagementService
                    .CreateSmsNotificationForEventAsync(
                        dto.Content.Body,
                        eventFilter.EventId.Value,
                        eventFilter.RegistrationStatuses,
                        eventFilter.RegistrationTypes);
            }
            else
            {
                smsNotification = await _notificationManagementService
                    .CreateSmsNotificationAsync(
                        dto.Content.Body,
                        dto.Recipients.PhoneNumbers);
            }

            // send notification right away, not queueing it or something.
            // TODO: use queue for messages

            await _notificationDeliveryService
                .SendNotificationAsync(smsNotification, cancellationToken);

            return Ok(new NotificationDto(smsNotification));
        }

        private async Task<EventParticipantsFilterDto> GetHappeningParticipantFilterAsync<TRecipients, TContent>(
            INotificationRequest<TRecipients, TContent> dto,
            CancellationToken cancellationToken = default)
            where TRecipients : Recipients
            where TContent : Content
        {
            var happeningFilter = dto.Recipients.Happening?.HappeningId;

            if (!AnyRecipientInformationAvailable(dto.Recipients) && !happeningFilter.HasValue)
            {
                _logger.LogWarning("Either a recipient list or happening filter must be specified.");
                throw new InputException("Either a recipient list or event participant filter must be specified.");
            }

            if (happeningFilter.HasValue)
            {
                return new EventParticipantsFilterDto
                {
                    EventId = dto.Recipients.Happening.HappeningId,
                    RegistrationStatuses = dto.Recipients.Happening.RegistrationStatuses,
                    RegistrationTypes = dto.Recipients.Happening.RegistrationTypes
                };
            }

            return null;
        }

        private bool AnyRecipientInformationAvailable(Recipients recipients)
        {
            return (recipients as EmailRecipients)?.EmailAddresses?.To?.Any() == true
                || (recipients as SmsRecipients)?.PhoneNumbers?.Any() == true
                || recipients?.Happening != null;
        }
    }

    public interface INotificationRequest<TRecipients, TContent>
    {
        public TRecipients Recipients { get; set; }
        public TContent Content { get; set; }
    }

    public class EmailNotificationRequest : INotificationRequest<EmailRecipients, EmailContent>
    {
        public EmailRecipients Recipients { get; set; }
        public EmailContent Content { get; set; }
    }

    public class SmsNotificationRequest : INotificationRequest<SmsRecipients, SmsContent>
    {
        public SmsRecipients Recipients { get; set; }
        public SmsContent Content { get; set; }
    }

    public abstract class Recipients
    {
        public Happening Happening { get; set; }
    }

    public class EmailRecipients : Recipients
    {
        public EmailAddresses EmailAddresses { get; set; }
    }

    public class SmsRecipients : Recipients
    {
        public string[] PhoneNumbers { get; set; }
    }

    public class EmailAddresses
    {
        public string[] To { get; set; }
        public string[] Cc { get; set; }
        public string[] Bcc { get; set; }
    }


    public class Happening
    {
        public int HappeningId { get; set; }
        public RegistrationType[] RegistrationTypes { get; set; }
        public RegistrationStatus[] RegistrationStatuses { get; set; }
    }

    public class Content
    {
        public dynamic Body { get; set; }
    }


    public class EmailContent : Content
    {
        [Required][MinLength(3)] public string Subject { get; set; }
        [Required][MinLength(5)] new public string Body { get; set; }
    }

    public class SmsContent : Content
    {
        [Required][MinLength(10)][MaxLength(320)] public new string Body { get; set; }
    }


}
