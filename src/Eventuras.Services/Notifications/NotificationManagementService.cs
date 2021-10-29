using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Auth;
using Eventuras.Services.Events;
using Eventuras.Services.Organizations;
using Eventuras.Services.Registrations;
using Microsoft.AspNetCore.Http;

namespace Eventuras.Services.Notifications
{
    internal class NotificationManagementService : INotificationManagementService
    {
        private readonly IEventInfoAccessControlService _eventInfoAccessControlService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;
        private readonly IRegistrationRetrievalService _registrationRetrievalService;
        private readonly ApplicationDbContext _context;

        public NotificationManagementService(
            IEventInfoAccessControlService eventInfoAccessControlService,
            ICurrentOrganizationAccessorService currentOrganizationAccessorService,
            IRegistrationRetrievalService registrationRetrievalService,
            IHttpContextAccessor httpContextAccessor,
            ApplicationDbContext context)
        {
            _eventInfoAccessControlService = eventInfoAccessControlService ?? throw
                new ArgumentNullException(nameof(eventInfoAccessControlService));

            _currentOrganizationAccessorService = currentOrganizationAccessorService ?? throw
                new ArgumentNullException(nameof(currentOrganizationAccessorService));

            _registrationRetrievalService = registrationRetrievalService ?? throw
                new ArgumentNullException(nameof(registrationRetrievalService));

            _httpContextAccessor = httpContextAccessor ?? throw
                new ArgumentNullException(nameof(httpContextAccessor));

            _context = context ?? throw
                new ArgumentNullException(nameof(context));
        }

        public async Task<EmailNotification> CreateEmailNotificationAsync(
            string subject,
            string body,
            string[] recipients)
        {
            var currentOrg =
                await _currentOrganizationAccessorService.GetCurrentOrganizationAsync();

            var currentUser = _httpContextAccessor.HttpContext.User;

            return await _context
                .CreateAsync(new EmailNotification(subject, body)
                {
                    CreatedByUserId = currentUser.GetUserId(),
                    OrganizationId = currentOrg?.OrganizationId,
                    Recipients = recipients
                        .Select(r => new NotificationRecipient(r))
                        .ToList()
                }, leaveAttached: true);
        }

        public async Task<EmailNotification> CreateEmailNotificationForEventAsync(
            string subject,
            string body,
            int eventId,
            int? productId,
            Registration.RegistrationStatus[] registrationStatuses,
            Registration.RegistrationType[] registrationTypes)
        {
            await _eventInfoAccessControlService
                .CheckEventUpdateAccessAsync(eventId);

            var recipients = new List<NotificationRecipient>();

            // Default status if not provided: Verified, attended and finished
            registrationStatuses ??= new[]
            {
                Registration.RegistrationStatus.Verified,
                Registration.RegistrationStatus.Attended,
                Registration.RegistrationStatus.Finished
            };

            // Default registration type is participants
            registrationTypes ??= new[]
            {
                Registration.RegistrationType.Participant
            };

            var reader = new PageReader<Registration>(async (offset, limit, token) =>
                await _registrationRetrievalService.ListRegistrationsAsync(
                    new RegistrationListRequest
                    {
                        Limit = limit,
                        Offset = offset,
                        Filter = new RegistrationFilter
                        {
                            EventInfoId = eventId,
                            ProductIds = productId.HasValue
                                ? new[] { productId.Value }
                                : null,
                            ActiveUsersOnly = true,
                            HavingStatuses = registrationStatuses,
                            HavingTypes = registrationTypes
                        }
                    },
                    new RegistrationRetrievalOptions
                    {
                        LoadUser = true,
                        ForUpdate = true
                    }, token));

            while (await reader.HasMoreAsync())
            {
                recipients.AddRange(from registration in await reader
                        .ReadNextAsync()
                    select new NotificationRecipient(registration));
            }

            var currentOrg =
                await _currentOrganizationAccessorService.GetCurrentOrganizationAsync();

            var currentUser = _httpContextAccessor.HttpContext.User;

            return await _context
                .CreateAsync(new EmailNotification(subject, body)
                {
                    CreatedByUserId = currentUser.GetUserId(),
                    OrganizationId = currentOrg?.OrganizationId,
                    EventInfoId = eventId,
                    ProductId = productId,
                    Recipients = recipients
                }, leaveAttached: true);
        }

        public async Task UpdateNotificationAsync(Notification notification)
        {
            if (notification == null)
            {
                throw new ArgumentNullException(nameof(notification));
            }

            if (notification.EventInfoId.HasValue)
            {
                await _eventInfoAccessControlService
                    .CheckEventUpdateAccessAsync(notification.EventInfoId.Value);
            }

            await _context.UpdateAsync(notification);
        }

        public async Task UpdateNotificationRecipientAsync(NotificationRecipient recipient)
        {
            if (recipient == null)
            {
                throw new ArgumentNullException(nameof(recipient));
            }

            await _context.UpdateAsync(recipient);
        }
    }
}
