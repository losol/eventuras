using Eventuras.Domain;
using Eventuras.Services.Notifications;
using Eventuras.Services.Registrations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Services;
using Microsoft.Extensions.Logging;
using static Eventuras.Domain.Registration;
using System.Text.Json.Serialization;

namespace Eventuras.WebApi.Controllers.Notifications
{
    // TODO: Use "notifications:send" auth Scope?
    [ApiVersion("3")]
    [Authorize(Policy = Constants.Auth.AdministratorRole)]
    [Route("v{version:apiVersion}/notifications/email")]
    [ApiController]

    public class EmailNotificationsController : ControllerBase
    {
        private readonly IRegistrationRetrievalService _registrationRetrievalService;
        private readonly IEmailNotificationService _emailNotificationService;
        private readonly ILogger<EmailNotificationsController> _logger;

        public EmailNotificationsController(
            IRegistrationRetrievalService registrationRetrievalService,
            IEmailNotificationService emailNotificationService,
            ILogger<EmailNotificationsController> logger)
        {
            _registrationRetrievalService = registrationRetrievalService ?? throw
                new ArgumentNullException(nameof(registrationRetrievalService));

            _emailNotificationService = emailNotificationService ?? throw
                new ArgumentNullException(nameof(emailNotificationService));

            _logger = logger ?? throw
                new ArgumentNullException(nameof(logger));
        }

        [HttpPost]
        public async Task<ActionResult<NotificationResponseDto>> SendEmail(EmailNotificationDto dto, CancellationToken cancellationToken)
        {
            var email = new EmailNotification
            {
                Subject = dto.Subject,
                BodyMarkdown = dto.BodyMarkdown
            };

            if (dto.Recipients?.Any() != true && dto.EventParticipants?.IsDefined != true)
            {
                return BadRequest("Either recipient list of eventparticipant filter must be specified");
            }

            if (dto.Recipients?.Any() == true && dto.EventParticipants?.IsDefined == true)
            {
                return BadRequest("Please provider either of recipient list or eventparticipants.");
            }

            var recipients = dto.Recipients ?? Array.Empty<string>();

            if (dto.EventParticipants?.IsDefined == true)
            {
                // Default status if not provided: Verified, attended and finished
                dto.EventParticipants.RegistrationStatuses ??= new[] {
                        RegistrationStatus.Verified,
                        RegistrationStatus.Attended,
                        RegistrationStatus.Finished
                        };

                // Default registration type is participants
                dto.EventParticipants.RegistrationTypes ??= new[] {
                        RegistrationType.Participant
                        };

                var reader = new PageReader<Registration>(async (offset, limit, token) =>
                        await _registrationRetrievalService.ListRegistrationsAsync(
                            new RegistrationListRequest
                            {
                                Limit = limit,
                                Offset = offset,
                                Filter = new RegistrationFilter
                                {
                                    EventInfoId = dto.EventParticipants.EventId,
                                    ActiveUsersOnly = true,
                                    HavingStatuses = dto.EventParticipants.RegistrationStatuses,
                                    HavingTypes = dto.EventParticipants.RegistrationTypes
                                }
                            },
                            new RegistrationRetrievalOptions
                            {
                                LoadUser = true
                            }, token));

                var recipientList = new List<string>();

                while (await reader.HasMoreAsync(cancellationToken))
                {
                    recipientList.AddRange(from registration in await reader
                            .ReadNextAsync(cancellationToken)
                                           let userName = registration.User?.Name
                                           let userEmail = registration.User?.Email
                                           where !string.IsNullOrEmpty(userEmail)
                                           select $"{userName} <{userEmail}>");
                }

                recipients = recipientList
                    .Distinct()
                    .ToArray();
            }

            if (recipients.Any())
            {
                await _emailNotificationService.SendEmailToRecipientsAsync(email, recipients, cancellationToken);
            }
            else
            {
                _logger.LogWarning("No recipients were selected by the notification filter criteria");
            }

            return Ok(new NotificationResponseDto
            {
                TotalRecipients = recipients.Length
            });
        }
    }

    public class EmailNotificationDto
    {
        [EmailRecipientList]
        public string[] Recipients { get; set; }

        public EventParticipantsDto EventParticipants { get; set; }

        [Required]
        [MinLength(3)]
        public string Subject { get; set; }

        [Required]
        [MinLength(10)]
        public string BodyMarkdown { get; set; }


    }

    public class EventParticipantsDto
    {
        [Range(1, int.MaxValue)]
        public int? EventId { get; set; }

        public Registration.RegistrationStatus[] RegistrationStatuses { get; set; }

        public Registration.RegistrationType[] RegistrationTypes { get; set; }

        public bool IsDefined => EventId.HasValue;
    }

    public class NotificationResponseDto
    {
        public int TotalRecipients { get; set; }
    }
}
