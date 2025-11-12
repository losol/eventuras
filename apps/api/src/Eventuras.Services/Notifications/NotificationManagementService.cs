using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Auth;
using Eventuras.Services.Events;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Eventuras.Services.Registrations;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.Notifications;

internal class NotificationManagementService : INotificationManagementService
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;
    private readonly IEventInfoAccessControlService _eventInfoAccessControlService;
    private readonly IEventInfoRetrievalService _eventInfoRetrievalService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<NotificationManagementService> _logger;
    private readonly IOrganizationRetrievalService _organizationRetrievalService;
    private readonly IRegistrationRetrievalService _registrationRetrievalService;

    public NotificationManagementService(
        IEventInfoRetrievalService eventInfoRetrievalService,
        IEventInfoAccessControlService eventInfoAccessControlService,
        ICurrentOrganizationAccessorService currentOrganizationAccessorService,
        IOrganizationRetrievalService organizationRetrievalService,
        IRegistrationRetrievalService registrationRetrievalService,
        IHttpContextAccessor httpContextAccessor,
        ApplicationDbContext context,
        ILogger<NotificationManagementService> logger)
    {
        _eventInfoRetrievalService = eventInfoRetrievalService ?? throw
            new ArgumentNullException(nameof(eventInfoRetrievalService));

        _eventInfoAccessControlService = eventInfoAccessControlService ?? throw
            new ArgumentNullException(nameof(eventInfoAccessControlService));

        _currentOrganizationAccessorService = currentOrganizationAccessorService ?? throw
            new ArgumentNullException(nameof(currentOrganizationAccessorService));

        _organizationRetrievalService = organizationRetrievalService ?? throw
            new ArgumentNullException(nameof(organizationRetrievalService));

        _registrationRetrievalService = registrationRetrievalService ?? throw
            new ArgumentNullException(nameof(registrationRetrievalService));

        _httpContextAccessor = httpContextAccessor ?? throw
            new ArgumentNullException(nameof(httpContextAccessor));

        _context = context ?? throw
            new ArgumentNullException(nameof(context));

        _logger = logger ?? throw
            new ArgumentNullException(nameof(logger));
    }

    public async Task<EmailNotification> CreateEmailNotificationAsync(
        string subject,
        string body,
        int orgId,
        string[] recipients
    )
    {
        _logger.LogInformation(
            $"Starting to create an email notification. Subject: {subject}, Number of recipients: {recipients?.Length ?? 0}");

        CheckSubjectAndBody(subject, body);

        var org = await _organizationRetrievalService.GetOrganizationByIdAsync(orgId);

        var currentUser = _httpContextAccessor.HttpContext.User;

        _logger.LogInformation(
            $"Current organization: {org.OrganizationId}. Current user id: {currentUser.GetUserId()}");

        return await _context
            .CreateAsync(new EmailNotification(subject, body)
            {
                CreatedByUserId = currentUser.GetUserId(),
                OrganizationId = org.OrganizationId,
                Recipients = recipients
                    .Select(NotificationRecipient.Email)
                    .ToList()
            }, true);
    }

    public async Task<EmailNotification> CreateEmailNotificationForRegistrationAsync(
        string subject,
        string body,
        Registration registration)
    {
        _logger.LogInformation(
            $"Starting to create an email notification based on registration. Registration: {registration.RegistrationId} Subject: {subject}");

        CheckSubjectAndBody(subject, body);

        var eventinfo = await _eventInfoRetrievalService.GetEventInfoByIdAsync(registration.EventInfoId);
        var organization =
            await _organizationRetrievalService.GetOrganizationByIdAsync(eventinfo.OrganizationId,
                accessControlDone: true);
        var currentUser = _httpContextAccessor.HttpContext.User;

        _logger.LogInformation(
            $"Current organization: {organization?.OrganizationId}. Current user id: {currentUser.GetUserId()}");

        var recipient = NotificationRecipient.Create(registration, NotificationType.Email);

        if (recipient != null)
        {
            // Manually attach existing entities to context
            _context.Attach(recipient);
            _context.Attach(organization);
            _context.Attach(registration);

            return await _context.CreateAsync(
                new EmailNotification(subject, body)
                {
                    CreatedByUserId = currentUser.GetUserId(),
                    EventInfoId = registration.EventInfoId,
                    OrganizationId = organization?.OrganizationId,
                    Recipients = new List<NotificationRecipient> { recipient }
                }, true);
        }

        _logger.LogError("Could not create NotificationRecipient. Skipping email creation.");
        throw new NotFoundException("Could not find recipient. Skipping email creation.");
    }


    public async Task<EmailNotification> CreateEmailNotificationForEventAsync(
        string subject,
        string body,
        int eventId,
        Registration.RegistrationStatus[] registrationStatuses,
        Registration.RegistrationType[] registrationTypes)
    {
        _logger.LogInformation($"Starting to create an email notification for event {eventId}. Subject: {subject}");
        CheckSubjectAndBody(subject, body);

        await CheckEventAccessAsync(eventId);

        var recipients = await GetRecipientsAsync(
            NotificationType.Email,
            eventId,
            registrationStatuses,
            registrationTypes);

        var currentOrg =
            await _currentOrganizationAccessorService.GetCurrentOrganizationAsync();

        var currentUser = _httpContextAccessor.HttpContext.User;

        _logger.LogInformation(
            $"Current organization: {currentOrg?.OrganizationId}. Current user id: {currentUser.GetUserId()}");

        return await _context
            .CreateAsync(
                new EmailNotification(subject, body)
                {
                    CreatedByUserId = currentUser.GetUserId(),
                    OrganizationId = currentOrg?.OrganizationId,
                    EventInfoId = eventId,
                    Recipients = recipients
                }, true);
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
            }, true);
    }

    public async Task<SmsNotification> CreateSmsNotificationForEventAsync(
        string message,
        int eventId,
        Registration.RegistrationStatus[] registrationStatuses = null,
        Registration.RegistrationType[] registrationTypes = null)
    {
        _logger.LogInformation($"Starting to create an SMS notification for event {eventId}. Message: {message}");
        await CheckEventAccessAsync(eventId);

        var recipients = await GetRecipientsAsync(
            NotificationType.Sms,
            eventId,
            registrationStatuses,
            registrationTypes);

        var currentOrg =
            await _currentOrganizationAccessorService.GetCurrentOrganizationAsync();

        var currentUser = _httpContextAccessor.HttpContext.User;

        return await _context
            .CreateAsync(
                new SmsNotification(message)
                {
                    CreatedByUserId = currentUser.GetUserId(),
                    OrganizationId = currentOrg?.OrganizationId,
                    EventInfoId = eventId,
                    Recipients = recipients
                }, true);
    }

    public async Task UpdateNotificationAsync(Notification notification)
    {
        if (notification == null)
        {
            throw new ArgumentNullException(nameof(notification));
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
        Registration.RegistrationStatus[] registrationStatuses,
        Registration.RegistrationType[] registrationTypes)
    {
        var recipients = new List<NotificationRecipient>();

        // Default status if not provided: Verified, attended, not attended and finished
        registrationStatuses ??= new[]
        {
            Registration.RegistrationStatus.Verified, Registration.RegistrationStatus.Attended,
            Registration.RegistrationStatus.NotAttended, Registration.RegistrationStatus.Finished
        };

        // Default registration type is participants
        registrationTypes ??= new[] { Registration.RegistrationType.Participant };

        var reader = new PageReader<Registration>(async (offset, limit, token) =>
            await _registrationRetrievalService.ListRegistrationsAsync(
                new RegistrationListRequest
                {
                    Limit = limit,
                    Offset = offset,
                    Filter = new RegistrationFilter
                    {
                        EventInfoId = eventId,
                        ActiveUsersOnly = true,
                        HavingStatuses = registrationStatuses,
                        HavingTypes = registrationTypes
                    }
                },
                new RegistrationRetrievalOptions { LoadUser = true, ForUpdate = true }, token));

        while (await reader.HasMoreAsync())
        {
            recipients.AddRange((from registration in await reader
                        .ReadNextAsync()
                    select NotificationRecipient.Create(registration, notificationType))
                .Where(r => r != null)); // user may have no phone, or email
        }

        return recipients;
    }
}
