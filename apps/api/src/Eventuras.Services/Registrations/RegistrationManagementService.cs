#nullable enable

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.BusinessEvents;
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
    private readonly IBusinessEventService _businessEventService;
    private readonly ApplicationDbContext _context;
    private readonly IEventInfoRetrievalService _eventInfoRetrievalService;
    private readonly ILogger<RegistrationManagementService> _logger;
    private readonly INotificationDeliveryService _notificationDeliveryService;
    private readonly INotificationManagementService _notificationsManagementService;
    private readonly IOrderManagementService _orderManagementService;
    private readonly IRegistrationAccessControlService _registrationAccessControlService;
    private readonly IRegistrationRetrievalService _registrationRetrievalService;
    private readonly IUserRetrievalService _userRetrievalService;

    public RegistrationManagementService(
        IRegistrationAccessControlService registrationAccessControlService,
        IRegistrationRetrievalService registrationRetrievalService,
        IOrderManagementService orderManagementService,
        IEventInfoRetrievalService eventInfoRetrievalService,
        INotificationDeliveryService notificationDeliveryService,
        INotificationManagementService notificationsManagementService,
        IUserRetrievalService userRetrievalService,
        IBusinessEventService businessEventService,
        ILogger<RegistrationManagementService> logger,
        ApplicationDbContext context)
    {
        _registrationAccessControlService = registrationAccessControlService;
        _registrationRetrievalService = registrationRetrievalService;
        _eventInfoRetrievalService = eventInfoRetrievalService;
        _notificationDeliveryService = notificationDeliveryService;
        _notificationsManagementService = notificationsManagementService;
        _userRetrievalService = userRetrievalService;
        _businessEventService = businessEventService;
        _context = context;
        _orderManagementService = orderManagementService;
        _logger = logger;
    }

    public async Task<Registration> CreateRegistrationAsync(
        int eventId,
        Guid userId,
        RegistrationOptions? options = null,
        CancellationToken cancellationToken = default)
    {
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
        var user = await _userRetrievalService.GetUserByIdAsync(userId, null, cancellationToken);

        var registration = new Registration { EventInfoId = eventId, UserId = userId, ParticipantName = user.Name };

        // Use the active default payment method from the database if available
        var defaultPaymentMethod = await _context.PaymentMethods
            .FirstOrDefaultAsync(pm => pm.IsDefault && pm.Active, cancellationToken);
        if (defaultPaymentMethod != null)
        {
            registration.PaymentMethod = defaultPaymentMethod.Provider;
        }

        // Check if the registration should be verified, and only set it if it's a draft
        if (options?.Verified == true && registration.Status == Registration.RegistrationStatus.Draft)
        {
            registration.Status = Registration.RegistrationStatus.Verified;
        }

        await _registrationAccessControlService.CheckRegistrationCreateAccessAsync(registration, cancellationToken);

        if (eventInfo.Status == EventInfo.EventInfoStatus.WaitingList)
        {
            registration.Status = Registration.RegistrationStatus.WaitingList;
        }

        await _context.CreateAsync(registration, true, cancellationToken);
        options ??= new RegistrationOptions();

        if (options.CreateOrder && registration.Status != Registration.RegistrationStatus.WaitingList)
        {
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
            if (eventInfo.WelcomeLetter != null)
            {
                await SendWelcomeLetterAsync(registration, cancellationToken);
            }
            else
            {
                _logger.LogDebug("No welcome letter found for EventInfoId {EventInfoId}", eventInfo.EventInfoId);
            }
        }

        _logger.LogInformation(
            "Created registration {RegistrationId} for EventId {EventId}, UserId {UserId}, Status {Status}",
            registration.RegistrationId, eventId, userId, registration.Status);
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

        // Load pre-update state (AsNoTracking, separate instance from the
        // incoming mutated entity) for audit-delta detection.
        var before = await _context.Registrations
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.RegistrationId == registration.RegistrationId, cancellationToken);

        if (before != null)
        {
            await EmitAuditEventsAsync(before, registration, cancellationToken);
        }

        await _context.UpdateAsync(registration, cancellationToken);
    }

    public async Task<Registration> CancelRegistrationAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var registration = await _registrationRetrievalService.GetRegistrationByIdAsync(
            id, null, cancellationToken);

        // Access is checked on the (soon-to-be) mutated entity before we
        // decide idempotency — a caller without update rights must not
        // silently succeed just because the registration is already
        // Cancelled.
        await _registrationAccessControlService.CheckRegistrationUpdateAccessAsync(registration, cancellationToken);

        // Idempotent: if already cancelled, do nothing and skip the audit
        // event. DELETE is not expected to emit a second "cancelled" record.
        if (registration.Status == Registration.RegistrationStatus.Cancelled)
        {
            return registration;
        }

        registration.Status = Registration.RegistrationStatus.Cancelled;

        // Cancellation gets its own dedicated message rather than the generic
        // status-delta text from EmitAuditEventsAsync.
        var organizationUuid = await _registrationRetrievalService
            .GetOrganizationUuidAsync(registration.RegistrationId, cancellationToken);
        _businessEventService.AddEvent(
            BusinessEventSubjects.ForRegistration(registration.Uuid),
            "registration.status.changed",
            "Registration cancelled",
            organizationUuid: organizationUuid);

        await _context.UpdateAsync(registration, cancellationToken);

        return registration;
    }

    private async Task EmitAuditEventsAsync(
        Registration before,
        Registration after,
        CancellationToken cancellationToken)
    {
        if (before.Status == after.Status && before.Type == after.Type)
        {
            return;
        }

        // Tenant derived from the registration's event organization — audit
        // data tracks the resource's owner, not any request header.
        var organizationUuid = await _registrationRetrievalService
            .GetOrganizationUuidAsync(after.RegistrationId, cancellationToken);

        if (before.Status != after.Status)
        {
            _businessEventService.AddEvent(
                BusinessEventSubjects.ForRegistration(after.Uuid),
                "registration.status.changed",
                $"Status changed from {before.Status} to {after.Status}",
                organizationUuid: organizationUuid);
        }

        if (before.Type != after.Type)
        {
            _businessEventService.AddEvent(
                BusinessEventSubjects.ForRegistration(after.Uuid),
                "registration.type.changed",
                $"Type changed from {before.Type} to {after.Type}",
                organizationUuid: organizationUuid);
        }
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
