using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Events.Products;
using Eventuras.Services.Notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static Eventuras.Domain.Registration;

namespace Eventuras.WebApi.Controllers.Notifications
{
    [ApiVersion("3")]
    [Authorize(Policy = Constants.Auth.AdministratorRole)]
    [Route("v{version:apiVersion}/notifications/email")]
    [ApiController]
    public class EmailNotificationsController : ControllerBase
    {
        private readonly INotificationManagementService _notificationManagementService;
        private readonly IEmailNotificationService _emailNotificationService;
        private readonly IProductRetrievalService _productRetrievalService;

        public EmailNotificationsController(
            INotificationManagementService notificationManagementService,
            IEmailNotificationService emailNotificationService,
            IProductRetrievalService productRetrievalService)
        {
            _emailNotificationService = emailNotificationService ?? throw
                new ArgumentNullException(nameof(emailNotificationService));

            _notificationManagementService = notificationManagementService ?? throw
                new ArgumentNullException(nameof(notificationManagementService));

            _productRetrievalService = productRetrievalService ?? throw
                new ArgumentNullException(nameof(productRetrievalService));
        }

        [HttpPost]
        public async Task<ActionResult<NotificationResponseDto>> SendEmail(EmailNotificationDto dto,
            CancellationToken cancellationToken)
        {
            var eventFilter = dto.EventParticipants;
            var eventFilterSet = eventFilter?.IsDefined == true;

            if (dto.Recipients?.Any() != true && !eventFilterSet)
            {
                return BadRequest("Either recipient list of event participant filter must be specified");
            }

            if (dto.Recipients?.Any() == true && eventFilterSet)
            {
                return BadRequest("Please provider either of recipient list or event participants.");
            }

            EmailNotification emailNotification;

            if (eventFilterSet)
            {
                if (eventFilter.ProductId.HasValue)
                {
                    var product =
                        await _productRetrievalService
                            .GetProductByIdAsync(eventFilter.ProductId.Value,
                                cancellationToken: cancellationToken);

                    if (eventFilter.EventId.HasValue)
                    {
                        if (product.EventInfoId != eventFilter.EventId.Value)
                        {
                            return BadRequest(
                                $"Product {product.ProductId} doesn't belong to event {eventFilter.EventId}");
                        }
                    }
                    else
                    {
                        eventFilter.EventId = product.EventInfoId;
                    }
                }

                emailNotification = await _notificationManagementService
                    .CreateEmailNotificationForEventAsync(
                        dto.Subject,
                        dto.BodyMarkdown,
                        eventFilter.EventId.Value,
                        eventFilter.ProductId,
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

            await _emailNotificationService
                .SendEmailNotificationAsync(emailNotification, cancellationToken);

            return Ok(new NotificationResponseDto(emailNotification));
        }
    }

    public class EmailNotificationDto
    {
        [EmailRecipientList] public string[] Recipients { get; set; }

        public EventParticipantsFilterDto EventParticipants { get; set; }

        [Required] [MinLength(3)] public string Subject { get; set; }

        [Required] [MinLength(10)] public string BodyMarkdown { get; set; }
    }

    public class EventParticipantsFilterDto
    {
        [Range(1, int.MaxValue)] public int? EventId { get; set; }

        [Range(1, int.MaxValue)] public int? ProductId { get; set; }

        public RegistrationStatus[] RegistrationStatuses { get; set; }

        public RegistrationType[] RegistrationTypes { get; set; }

        public bool IsDefined => EventId.HasValue || ProductId.HasValue;
    }
}
