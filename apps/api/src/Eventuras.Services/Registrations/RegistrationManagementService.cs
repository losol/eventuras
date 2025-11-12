#nullable enable

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Events;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Notifications;
using Eventuras.Services.Orders;
using Eventuras.Services.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.Registrations;

internal class RegistrationManagementService : IRegistrationManagementService
{
    private readonly ApplicationDbContext _context;
    private readonly IEventInfoRetrievalService _eventInfoRetrievalService;
    private readonly ILogger<RegistrationManagementService> _logger;
    private readonly INotificationDeliveryService _notificationDeliveryService;
    private readonly INotificationManagementService _notificationsManagementService;
    private readonly IOrderManagementService _orderManagementService;
    private readonly IRegistrationAccessControlService _registrationAccessControlService;
    private readonly IUserRetrievalService _userRetrievalService;

    public RegistrationManagementService(
        IRegistrationAccessControlService registrationAccessControlService,
        IOrderManagementService orderManagementService,
        IEventInfoRetrievalService eventInfoRetrievalService,
        INotificationDeliveryService notificationDeliveryService,
        INotificationManagementService notificationsManagementService,
        IUserRetrievalService userRetrievalService,
        ILogger<RegistrationManagementService> logger,
        ApplicationDbContext context)
    {
        _registrationAccessControlService = registrationAccessControlService;
        _eventInfoRetrievalService = eventInfoRetrievalService;
        _notificationDeliveryService = notificationDeliveryService;
        _notificationsManagementService = notificationsManagementService;
        _userRetrievalService = userRetrievalService;
        _context = context;
        _orderManagementService = orderManagementService;
        _logger = logger;
    }

    public async Task<Registration> CreateRegistrationAsync(
        int eventId,
        string userId,
        RegistrationOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "RegistrationManagementService: Attempting to create registration for EventId: {EventId}, UserId: {UserId}",
            eventId, userId);

        var existingRegistration = await _context.Registrations
            .FirstOrDefaultAsync(m => m.EventInfoId == eventId
                                      && m.UserId == userId,
                cancellationToken);

        if (existingRegistration != null)
        {
            _logger.LogWarning("Found existing registration for user on event: EventId {EventId}, UserId {UserId}.",
                eventId, userId);
            throw new DuplicateException("Found existing registration for user on event.");
        }

        var eventInfo = await _eventInfoRetrievalService.GetEventInfoByIdAsync(eventId,
            new EventInfoRetrievalOptions { ForUpdate = true, LoadRegistrations = true, LoadProducts = true },
            cancellationToken);
        _logger.LogInformation(
            $"Retrieved event info for EventInfoId {eventInfo.EventInfoId}, Status {eventInfo.Status}");

        var user = await _userRetrievalService.GetUserByIdAsync(userId, null, cancellationToken);

        var registration = new Registration { EventInfoId = eventId, UserId = userId, ParticipantName = user.Name };

        // Check if the registration should be verified, and only set it if it's a draft
        if (options?.Verified == true && registration.Status == Registration.RegistrationStatus.Draft)
        {
            registration.Status = Registration.RegistrationStatus.Verified;
        }

        _logger.LogInformation(
            $"Checking create access for registration: UserId {registration.UserId}, EventInfoId {registration.EventInfoId}");
        await _registrationAccessControlService.CheckRegistrationCreateAccessAsync(registration, cancellationToken);

        if (eventInfo.Status == EventInfo.EventInfoStatus.WaitingList)
        {
            registration.Status = Registration.RegistrationStatus.WaitingList;
        }

        await _context.CreateAsync(registration, true, cancellationToken);
        _logger.LogInformation($"Successfully created registration for EventId: {eventId}, UserId: {userId}");

        options ??= new RegistrationOptions();

        if (options.CreateOrder && registration.Status != Registration.RegistrationStatus.WaitingList)
        {
            _logger.LogInformation(
                "Creating order for registration: RegistrationId {RegistrationId}, EventInfoId {EventInfoId}",
                registration.RegistrationId, registration.EventInfoId);

            var mandatoryItems = eventInfo.Products
                .Where(p => p.IsMandatory)
                .Select(p => new OrderLineModel(p.ProductId, null, p.MinimumQuantity))
                .ToArray();

            if (mandatoryItems.Any())
            {
                await _orderManagementService
                    .CreateOrderForRegistrationAsync(
                        registration.RegistrationId,
                        mandatoryItems,
                        cancellationToken);
            }
        }

        var nonCancelledRegistrationsCount = eventInfo.Registrations
            .Count(reg => reg.Status != Registration.RegistrationStatus.Cancelled);

        if (eventInfo.MaxParticipants > 0
            && nonCancelledRegistrationsCount + 1 >= eventInfo.MaxParticipants)
        {
            _logger.LogInformation("Event {EventId} has reached max participants, changing status to WaitingList",
                eventId);
            eventInfo.Status = EventInfo.EventInfoStatus.WaitingList;
            await _context.SaveChangesAsync(cancellationToken);
        }

        if (options.SendWelcomeLetter && registration.Status != Registration.RegistrationStatus.WaitingList)
        {
            _logger.LogInformation(
                "Sending welcome letter for registration: RegistrationId {RegistrationId}, EventInfoId {EventInfoId}",
                registration.RegistrationId, registration.EventInfoId);
            if (eventInfo.WelcomeLetter != null)
            {
                await SendWelcomeLetterAsync(registration, cancellationToken);
            }
            else
            {
                _logger.LogInformation("No welcome letter found for EventInfoId {EventInfoId}", eventInfo.EventInfoId);
            }
        }

        _logger.LogInformation("Successfully created registration for EventId: {EventId}, UserId: {UserId}", eventId,
            userId);
        return registration;
    }

    public async Task UpdateRegistrationAsync(
        Registration registration,
        CancellationToken cancellationToken = default)
    {
        if (registration == null)
        {
            _logger.LogError("Did not find registration for update");
            throw new ArgumentNullException(nameof(registration));
        }

        await _registrationAccessControlService.CheckRegistrationUpdateAccessAsync(registration, cancellationToken);

        await _context.UpdateAsync(registration, cancellationToken);
    }

    public async Task SendWelcomeLetterAsync(Registration registration, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            $"Starting to send a welcome letter for RegistrationId {registration.RegistrationId}, EventInfoId {registration.EventInfoId}");
        if (registration == null)
        {
            _logger.LogError("Did not find registration for welcome letter");
            throw new ArgumentNullException(nameof(registration));
        }

        if (registration.User == null)
        {
            registration.User =
                await _userRetrievalService.GetUserByIdAsync(registration.UserId, null, cancellationToken);
        }

        if (registration.EventInfo == null)
        {
            registration.EventInfo =
                await _eventInfoRetrievalService.GetEventInfoByIdAsync(registration.EventInfoId, null,
                    cancellationToken);
        }

        // Compose the subject and body for the welcome email
        var subject = registration.EventInfo.Title;
        var body = registration.EventInfo.WelcomeLetter;

        // Create email notification
        var email = await _notificationsManagementService.CreateEmailNotificationForRegistrationAsync(subject, body,
            registration);
        await _notificationDeliveryService.SendNotificationAsync(email, true, cancellationToken);

        _logger.LogInformation(
            $"Successfully sent a welcome letter for RegistrationId {registration.RegistrationId}, EventInfoId {registration.EventInfoId}");
    }
}
