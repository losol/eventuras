using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Auth;
using Eventuras.Services.Events;
using Eventuras.Services.Organizations;
using Eventuras.Services.Registrations;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Eventuras.Services.Notifications
{
    internal class NotificationManagementService : INotificationManagementService
    {
        private readonly IEventInfoRetrievalService _eventInfoRetrievalService;
        private readonly IEventInfoAccessControlService _eventInfoAccessControlService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;
        private readonly IRegistrationRetrievalService _registrationRetrievalService;
        private readonly ApplicationDbContext _context;

        public NotificationManagementService(
            IEventInfoRetrievalService eventInfoRetrievalService,
            IEventInfoAccessControlService eventInfoAccessControlService,
            ICurrentOrganizationAccessorService currentOrganizationAccessorService,
            IRegistrationRetrievalService registrationRetrievalService,
            IHttpContextAccessor httpContextAccessor,
            ApplicationDbContext context)
        {
            _eventInfoRetrievalService = eventInfoRetrievalService ?? throw
                new ArgumentNullException(nameof(eventInfoRetrievalService));

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
            CheckSubjectAndBody(subject, body);

            var currentOrg =
                await _currentOrganizationAccessorService.GetCurrentOrganizationAsync();

            var currentUser = _httpContextAccessor.HttpContext.User;

            return await _context
                .CreateAsync(new EmailNotification(subject, body)
                {
                    CreatedByUserId = currentUser.GetUserId(),
                    OrganizationId = currentOrg?.OrganizationId,
                    Recipients = recipients
                        .Select(NotificationRecipient.Email)
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
            CheckSubjectAndBody(subject, body);

            await CheckEventAccessAsync(eventId);

            var recipients = await GetRecipientsAsync(
                NotificationType.Email,
                eventId, productId,
                registrationStatuses,
                registrationTypes);

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

        public async Task<SmsNotification> CreateSmsNotificationAsync(
            string message,
            params string[] recipients)
        {
            var currentOrg =
                await _currentOrganizationAccessorService.GetCurrentOrganizationAsync();

            var currentUser = _httpContextAccessor.HttpContext.User;

            return await _context
                .CreateAsync(new SmsNotification(message)
                {
                    CreatedByUserId = currentUser.GetUserId(),
                    OrganizationId = currentOrg?.OrganizationId,
                    Recipients = recipients
                        .Select(NotificationRecipient.Sms)
                        .ToList()
                }, leaveAttached: true);
        }

        public async Task<SmsNotification> CreateSmsNotificationForEventAsync(
            string message,
            int eventId,
            int? productId = null,
            Registration.RegistrationStatus[] registrationStatuses = null,
            Registration.RegistrationType[] registrationTypes = null)
        {
            await CheckEventAccessAsync(eventId);

            var recipients = await GetRecipientsAsync(
                NotificationType.Sms,
                eventId, productId,
                registrationStatuses,
                registrationTypes);

            var currentOrg =
                await _currentOrganizationAccessorService.GetCurrentOrganizationAsync();

            var currentUser = _httpContextAccessor.HttpContext.User;

            return await _context
                .CreateAsync(new SmsNotification(message)
                {
                    CreatedByUserId = currentUser.GetUserId(),
                    OrganizationId = currentOrg?.OrganizationId,
                    EventInfoId = eventId,
                    ProductId = productId,
                    Recipients = recipients
                }, leaveAttached: true);
        }

        private async Task CheckEventAccessAsync(int eventId)
        {
            var eventInfo = await _eventInfoRetrievalService
                .GetEventInfoByIdAsync(eventId);

            await _eventInfoAccessControlService
                .CheckEventManageAccessAsync(eventInfo);
        }

        private static void CheckSubjectAndBody(string subject, string body)
        {
            if (string.IsNullOrEmpty(subject))
            {
                throw new ArgumentException($"{nameof(subject)} must not be empty");
            }

            if (string.IsNullOrEmpty(body))
            {
                throw new ArgumentException($"{nameof(body)} must not be empty");
            }
        }

        private async Task<List<NotificationRecipient>> GetRecipientsAsync(
            NotificationType notificationType,
            int eventId,
            int? productId,
            Registration.RegistrationStatus[] registrationStatuses,
            Registration.RegistrationType[] registrationTypes)
        {
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
                                : Array.Empty<int>(),
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
                recipients.AddRange((from registration in await reader
                            .ReadNextAsync()
                                     select NotificationRecipient.Create(registration, notificationType))
                    .Where(r => r != null)); // user may have no phone, or email
            }

            return recipients;
        }

        public async Task UpdateNotificationAsync(Notification notification)
        {
            if (notification == null)
            {
                throw new ArgumentNullException(nameof(notification));
            }

            if (notification.EventInfoId.HasValue)
            {
                await CheckEventAccessAsync(notification.EventInfoId.Value);
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