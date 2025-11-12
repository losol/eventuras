using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Auth;
using Eventuras.Services.Events;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using NodaTime;

namespace Eventuras.Services.Registrations;

internal class RegistrationAccessControlService : IRegistrationAccessControlService
{
    private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;
    private readonly IEventInfoRetrievalService _eventInfoRetrievalService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<RegistrationAccessControlService> _logger;

    public RegistrationAccessControlService(
        IHttpContextAccessor httpContextAccessor,
        IEventInfoRetrievalService eventInfoRetrievalService,
        ICurrentOrganizationAccessorService currentOrganizationAccessorService,
        ILogger<RegistrationAccessControlService> logger)
    {
        _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        _eventInfoRetrievalService = eventInfoRetrievalService ??
                                     throw new ArgumentNullException(nameof(eventInfoRetrievalService));
        _currentOrganizationAccessorService =
            currentOrganizationAccessorService ??
            throw new ArgumentNullException(nameof(currentOrganizationAccessorService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task CheckRegistrationReadAccessAsync(Registration registration,
        CancellationToken cancellationToken = default)
    {
        var user = _httpContextAccessor.HttpContext!.User;
        if (!await CheckOwnerOrAdminAccessAsync(user, registration, cancellationToken))
        {
            throw new NotAccessibleException(
                $"User {user.GetUserId()} cannot read registration {registration.RegistrationId}");
        }
    }

    public async Task CheckRegistrationCreateAccessAsync(Registration registration,
        CancellationToken cancellationToken = default)
    {
        if (_httpContextAccessor.HttpContext == null)
        {
            throw new InvalidOperationException("HttpContext is not available.");
        }

        var contextUser = _httpContextAccessor.HttpContext.User;
        var requestingUserId = contextUser.GetUserId();

        _logger.LogInformation(
            "CheckRegistrationCreateAccess. Context user id '{UserId}', registration.UserId {RegistrationUserId}, registration.EventInfoId {RegistrationEventInfoId}",
            contextUser.GetUserId(),
            registration.UserId,
            registration.EventInfoId);

        var eventInfo =
            await _eventInfoRetrievalService.GetEventInfoByIdAsync(registration.EventInfoId, cancellationToken);

        if (contextUser.IsAnonymous())
        {
            _logger.LogWarning(
                $"Anonymous user cannot create registration for event {eventInfo.Title} with id {eventInfo.EventInfoId}. Access denied.");
            throw new NotAccessibleException("Anonymous user cannot create registration for events.");
        }

        // Add possibility for organization admin to override registration policy
        if (!contextUser.IsAdmin())
        {
            if (eventInfo.Status != EventInfo.EventInfoStatus.RegistrationsOpen &&
                eventInfo.Status != EventInfo.EventInfoStatus.WaitingList)
            {
                _logger.LogWarning(
                    $"Registrations are closed for event {eventInfo.Title} with id {eventInfo.EventInfoId}. Access denied for User {contextUser.GetUserId()}.");
                throw new NotAccessibleException(
                    $"Registrations are closed for event {eventInfo.Title} with id {eventInfo.EventInfoId}.");
            }
        }

        if (!await CheckOwnerOrAdminAccessAsync(contextUser, registration, cancellationToken))
        {
            _logger.LogWarning(
                $"User {contextUser.GetUserId()} cannot create registration for event {registration.EventInfoId} and user {registration.UserId}. Access denied.");

            throw new NotAccessibleException(
                $"User {contextUser.GetUserId()} cannot create registration for event {registration.EventInfoId} and user {registration.UserId}");
        }

        _logger.LogInformation(
            $"Create access granted for UserId {registration.UserId}, EventInfoId {registration.EventInfoId}");
    }

    public async Task CheckRegistrationUpdateAccessAsync(Registration registration,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            $"Checking update access for registration: RegistrationId {registration.RegistrationId}, EventInfoId {registration.EventInfoId}");

        var user = _httpContextAccessor.HttpContext!.User;

        // Admins can update any registration
        var isAdmin = await CheckAdminAccessAsync(user, registration, cancellationToken);
        if (isAdmin)
        {
            _logger.LogInformation($"Admin was granted access to update RegistrationId {registration.RegistrationId}");
            return;
        }

        // Check if the user is the owner of the registration
        var isOwner = user.GetUserId() == registration.UserId;
        if (!isOwner)
        {
            // Not admin, not owner, no access
            _logger.LogWarning(
                $"User {user.GetUserId()} cannot update registration {registration.RegistrationId}. Access denied.");
            throw new NotAccessibleException(
                $"User {user.GetUserId()} cannot update registration {registration.RegistrationId}");
        }

        // Get the registration policy for the event
        var eventInfo =
            await _eventInfoRetrievalService.GetEventInfoByIdAsync(registration.EventInfoId, cancellationToken);
        _logger.LogInformation(
            $"Retrieved event info for EventInfoId {eventInfo.EventInfoId}. Checking registration policy.");
        var registrationPolicy = eventInfo.Options.RegistrationPolicy;

        // Allow updates until last registration date
        var now = SystemClock.Instance.GetCurrentInstant();
        var timeZone = DateTimeZone.Utc;

        if (eventInfo.LastRegistrationDate.HasValue)
        {
            // add 24 hours to the last registration date to allow updates until the end of the day
            var lastRegistrationDateZonedDateTime = eventInfo.LastRegistrationDate.Value.AtMidnight()
                .InZoneLeniently(timeZone).PlusHours(24);
            var lastRegistrationDateInstant = lastRegistrationDateZonedDateTime.ToInstant();

            if (now < lastRegistrationDateInstant)
            {
                _logger.LogInformation(
                    "LastRegistrationDate is set and the event is not closed for registration updates. Access granted.");
                return;
            }
        }

        // If AllowedRegistrationEditHours is set, grant access if the registration is not too old
        if (registrationPolicy.AllowedRegistrationEditHours != null)
        {
            var maxDuration =
                Duration.FromTimeSpan(TimeSpan.FromHours(registrationPolicy.AllowedRegistrationEditHours.Value));
            var sinceRegistrationTimeDuration =
                Instant.FromDateTimeOffset(DateTimeOffset.UtcNow) - registration.RegistrationTime;

            if (sinceRegistrationTimeDuration > maxDuration)
            {
                _logger.LogWarning("Registration is too old to be updated. Access denied.");
                throw new NotAccessibleException("Registration is too old to be updated.");
            }

            _logger.LogInformation("Registration is within AllowedRegistrationEditHours. Access granted.");
            return;
        }

        // If AllowModificationsAfterLastCancellationDate allow updates until 48 hours before the event
        if (registrationPolicy.AllowModificationsAfterLastCancellationDate && eventInfo.DateStart.HasValue &&
            eventInfo.LastCancellationDate.HasValue)
        {
            var eventStartZonedDateTime = eventInfo.DateStart.Value.AtMidnight().InZoneLeniently(timeZone);
            var eventClosedForRegistrationUpdatesZonedDateTime = eventStartZonedDateTime.Minus(Duration.FromHours(48));
            var eventClosedForRegistrationUpdatesInstant = eventClosedForRegistrationUpdatesZonedDateTime.ToInstant();

            if (now < eventClosedForRegistrationUpdatesInstant)
            {
                _logger.LogInformation(
                    "AllowModificationsAfterLastCancellationDate is set and the event is not closed for registration updates. Access granted.");
                return;
            }
        }

        // If none of the above conditions are met, deny access
        _logger.LogWarning("Could not grant registration update access.");
        throw new NotAccessibleException("Could not grant registration update access.");
    }

    public async Task<IQueryable<Registration>> AddAccessFilterAsync(IQueryable<Registration> query,
        CancellationToken cancellationToken = default)
    {
        var user = _httpContextAccessor.HttpContext!.User;
        if (user.IsAnonymous())
        {
            throw new NotAccessibleException("Anonymous users are not permitted to list any registrations.");
        }

        if (user.IsPowerAdmin())
        {
            return query; // super admins can ready any reg
        }

        if (!user.IsAdmin())
            // non-admins can only read their own registrations
        {
            return query.Where(r => r.UserId == user.GetUserId());
        }

        var org = await _currentOrganizationAccessorService.RequireCurrentOrganizationAsync(null, cancellationToken);

        return query.Where(r
            => r.EventInfo.OrganizationId == org.OrganizationId &&
               r.EventInfo.Organization.Members.Any(m => m.UserId == user.GetUserId()));
    }

    private async Task<bool> CheckAdminAccessAsync(ClaimsPrincipal user, Registration registration,
        CancellationToken cancellationToken = default)
    {
        if (user.IsPowerAdmin())
        {
            return true;
        }

        if (!user.IsAdmin())
        {
            return false;
        }

        var org = await _currentOrganizationAccessorService.RequireCurrentOrganizationAsync(
            new OrganizationRetrievalOptions { LoadMembers = true },
            cancellationToken);

        if (org.Members.TrueForAll(m => m.UserId != user.GetUserId()))
        {
            return false;
        }

        var @event =
            await _eventInfoRetrievalService.GetEventInfoByIdAsync(registration.EventInfoId, cancellationToken);
        return @event.OrganizationId == org.OrganizationId;
    }

    private async Task<bool> CheckOwnerOrAdminAccessAsync(
        ClaimsPrincipal user,
        Registration registration,
        CancellationToken cancellationToken = default)
    {
        if (user.IsAnonymous())
        {
            return false;
        }

        if (registration.UserId == user.GetUserId())
        {
            return true;
        }

        return await CheckAdminAccessAsync(user, registration, cancellationToken);
    }
}
