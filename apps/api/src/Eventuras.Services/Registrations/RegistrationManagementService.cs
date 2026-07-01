#nullable enable

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Auth;
using Eventuras.Services.BusinessEvents;
using Eventuras.Services.Events;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Orders;
using Eventuras.Services.Registrations.Notifications;
using Eventuras.Services.Users;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.Registrations;

internal class RegistrationManagementService : IRegistrationManagementService
{
    private readonly IBusinessEventService _businessEventService;
    private readonly ApplicationDbContext _context;
    private readonly IEventInfoRetrievalService _eventInfoRetrievalService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<RegistrationManagementService> _logger;
    private readonly IRegistrationNotificationService _notificationService;
    private readonly IOrderManagementService _orderManagementService;
    private readonly IRegistrationAccessControlService _registrationAccessControlService;
    private readonly IRegistrationRetrievalService _registrationRetrievalService;
    private readonly IUserRetrievalService _userRetrievalService;

    public RegistrationManagementService(
        IRegistrationAccessControlService registrationAccessControlService,
        IRegistrationRetrievalService registrationRetrievalService,
        IOrderManagementService orderManagementService,
        IEventInfoRetrievalService eventInfoRetrievalService,
        IRegistrationNotificationService notificationService,
        IUserRetrievalService userRetrievalService,
        IBusinessEventService businessEventService,
        IHttpContextAccessor httpContextAccessor,
        ILogger<RegistrationManagementService> logger,
        ApplicationDbContext context)
    {
        _registrationAccessControlService = registrationAccessControlService;
        _registrationRetrievalService = registrationRetrievalService;
        _eventInfoRetrievalService = eventInfoRetrievalService;
        _notificationService = notificationService;
        _userRetrievalService = userRetrievalService;
        _businessEventService = businessEventService;
        _httpContextAccessor = httpContextAccessor;
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

        options ??= new RegistrationOptions();

        var registration = new Registration { EventInfoId = eventId, UserId = userId };

        // Access check runs before the capacity gate: a non-admin hitting an
        // event that is already RegistrationsClosed should get 403 (semantic
        // "not for you") rather than 400 (the post-fill capacity error). The
        // gate below is for the in-flight overflow case while the event is
        // still nominally Open.
        await _registrationAccessControlService.CheckRegistrationCreateAccessAsync(registration, cancellationToken);

        // Hard capacity gate for self-service flows. Until the waitlist email
        // flow is in place, refuse new registrations when the event has
        // reached MaxParticipants instead of silently sending a welcome letter
        // to participant N+1. Admin flows pass EnforceCapacity=false to
        // override (manual overbooking).
        if (options.EnforceCapacity && eventInfo.MaxParticipants > 0)
        {
            var activeCount = eventInfo.Registrations
                .Count(reg => reg.Status != Registration.RegistrationStatus.Cancelled);
            if (activeCount >= eventInfo.MaxParticipants)
            {
                _logger.LogInformation(
                    "Refusing registration: EventId {EventId} at capacity ({Active}/{Max})",
                    eventId, activeCount, eventInfo.MaxParticipants);
                throw new InvalidOperationServiceException(
                    $"Event {eventId} has reached its maximum participant capacity ({eventInfo.MaxParticipants}).");
            }
        }

        var user = await _userRetrievalService.GetUserByIdAsync(userId, null, cancellationToken);
        registration.ParticipantName = user.Name;

        // Use the active default payment method from the database if available
        var defaultPaymentMethod = await _context.PaymentMethods
            .FirstOrDefaultAsync(pm => pm.IsDefault && pm.Active, cancellationToken);
        if (defaultPaymentMethod != null)
        {
            registration.PaymentMethod = defaultPaymentMethod.Provider;
        }

        // Check if the registration should be verified, and only set it if it's a draft
        if (options.Verified && registration.Status == Registration.RegistrationStatus.Draft)
        {
            registration.Status = Registration.RegistrationStatus.Verified;
        }

        if (eventInfo.Status == EventInfo.EventInfoStatus.WaitingList)
        {
            registration.Status = Registration.RegistrationStatus.WaitingList;
        }

        await _context.CreateAsync(registration, true, cancellationToken);

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
            // Flip to RegistrationsClosed (not WaitingList) so the public
            // event page renders the "closed" badge and the next registration
            // attempt is refused by the capacity gate above. Will move to
            // WaitingList once the waitlist-email flow is in place.
            _logger.LogInformation(
                "Event {EventId} has reached max participants, closing registrations",
                eventId);
            var previousStatus = eventInfo.Status;
            eventInfo.Status = EventInfo.EventInfoStatus.RegistrationsClosed;
            await _context.SaveChangesAsync(cancellationToken);

            // Emit the same `event.status.changed` business event the
            // EventManagementService does for manual transitions, so the
            // audit trail records auto-close just like operator-initiated
            // status changes. Actor is the registering user — the person
            // whose registration triggered the auto-flip.
            if (previousStatus != eventInfo.Status)
            {
                var organizationUuid = await _context.Organizations
                    .AsNoTracking()
                    .Where(o => o.OrganizationId == eventInfo.OrganizationId)
                    .Select(o => (Guid?)o.Uuid)
                    .FirstOrDefaultAsync(cancellationToken);
                _businessEventService.AddEvent(
                    BusinessEventSubjects.ForEvent(eventInfo.Uuid),
                    "event.status.changed",
                    $"Status changed from {previousStatus} to {eventInfo.Status} (auto: reached MaxParticipants {eventInfo.MaxParticipants})",
                    organizationUuid: organizationUuid,
                    actorUserUuid: _httpContextAccessor.HttpContext?.User?.GetUserId());
            }
        }

        // Status-driven: receipt for Verified, waiting-list email for WaitingList,
        // nothing for other statuses.
        await _notificationService.NotifyStatusChangeAsync(registration, previousStatus: null, cancellationToken);

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

        // Send the status email on an actual status change (e.g. -> WaitingList
        // sends the waiting-list email, not a confirmation).
        if (before != null && before.Status != registration.Status)
        {
            await _notificationService.NotifyStatusChangeAsync(registration, before.Status, cancellationToken);
        }
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
            organizationUuid: organizationUuid,
            actorUserUuid: _httpContextAccessor.HttpContext?.User?.GetUserId());

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

        // Actor is the authenticated user from the current request, if any.
        // Null for background jobs / anonymous paths.
        var actorUserUuid = _httpContextAccessor.HttpContext?.User?.GetUserId();

        if (before.Status != after.Status)
        {
            _businessEventService.AddEvent(
                BusinessEventSubjects.ForRegistration(after.Uuid),
                "registration.status.changed",
                $"Status changed from {before.Status} to {after.Status}",
                organizationUuid: organizationUuid,
                actorUserUuid: actorUserUuid);
        }

        if (before.Type != after.Type)
        {
            _businessEventService.AddEvent(
                BusinessEventSubjects.ForRegistration(after.Uuid),
                "registration.type.changed",
                $"Type changed from {before.Type} to {after.Type}",
                organizationUuid: organizationUuid,
                actorUserUuid: actorUserUuid);
        }
    }
}
