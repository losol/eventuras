using Eventuras.Domain;
using Eventuras.Services.Auth;
using Eventuras.Services.Events;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using NodaTime;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.Registrations
{
    internal class RegistrationAccessControlService : IRegistrationAccessControlService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IEventInfoRetrievalService _eventInfoRetrievalService;
        private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;
        private readonly ILogger<RegistrationAccessControlService> _logger;

        public RegistrationAccessControlService(
            IHttpContextAccessor httpContextAccessor,
            IEventInfoRetrievalService eventInfoRetrievalService,
            ICurrentOrganizationAccessorService currentOrganizationAccessorService,
            ILogger<RegistrationAccessControlService> logger
            )
        {
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
            _eventInfoRetrievalService = eventInfoRetrievalService ?? throw new ArgumentNullException(nameof(eventInfoRetrievalService));
            _currentOrganizationAccessorService = currentOrganizationAccessorService ?? throw new ArgumentNullException(nameof(currentOrganizationAccessorService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task CheckRegistrationReadAccessAsync(Registration registration, CancellationToken cancellationToken)
        {
            var user = _httpContextAccessor.HttpContext.User;
            if (!await CheckOwnerOrAdminAccessAsync(user, registration, cancellationToken))
            {
                throw new NotAccessibleException($"User {user.GetUserId()} cannot read registration {registration.RegistrationId}");
            }
        }

        public async Task CheckRegistrationCreateAccessAsync(Registration registration, CancellationToken cancellationToken)
        {
            var requestingUser = _httpContextAccessor.HttpContext.User;
            var requestingUserId = requestingUser.GetUserId();

            _logger.LogInformation($"Checking create access. Requesting user with id {requestingUserId} for registration: UserId {registration.UserId}, EventInfoId {registration.EventInfoId}");

            var eventInfo = await _eventInfoRetrievalService.GetEventInfoByIdAsync(registration.EventInfoId, cancellationToken);

            if (requestingUser.IsAnonymous())
            {
                _logger.LogWarning($"Anonymous user cannot create registration for event {eventInfo.Title} with id {eventInfo.EventInfoId}. Access denied.");
                throw new NotAccessibleException($"Anonymous user cannot create registration for events.");
            }

            // Add possibility for organization admin to override registration policy
            if (!requestingUser.IsAdmin())
            {
                if (eventInfo.Status != EventInfo.EventInfoStatus.RegistrationsOpen && eventInfo.Status != EventInfo.EventInfoStatus.WaitingList)
                {
                    _logger.LogWarning($"Registrations are closed for event {eventInfo.Title} with id {eventInfo.EventInfoId}. Access denied for User {requestingUser.GetUserId()}.");
                    throw new NotAccessibleException($"Registrations are closed for event {eventInfo.Title} with id {eventInfo.EventInfoId}.");
                }
            }

            if (!await CheckOwnerOrAdminAccessAsync(requestingUser, registration, cancellationToken))
            {
                _logger.LogWarning($"User {requestingUser.GetUserId()} cannot create registration for event {registration.EventInfoId} and user {registration.UserId}. Access denied.");

                throw new NotAccessibleException(
                    $"User {requestingUser.GetUserId()} cannot create registration for event {registration.EventInfoId} and user {registration.UserId}");
            }
            _logger.LogInformation($"Create access granted for UserId {registration.UserId}, EventInfoId {registration.EventInfoId}");

        }

        public async Task CheckRegistrationUpdateAccessAsync(Registration registration, CancellationToken cancellationToken)
        {
            _logger.LogInformation($"Checking update access for registration: RegistrationId {registration.RegistrationId}, EventInfoId {registration.EventInfoId}");

            var user = _httpContextAccessor.HttpContext!.User;

            var isAdmin = await CheckAdminAccessAsync(user, registration, cancellationToken);
            if (isAdmin)
            {
                _logger.LogInformation($"Admin access granted for RegistrationId {registration.RegistrationId}");
                return;
            }

            var isOwner = user.GetUserId() == registration.UserId;
            if (!isOwner)
            {
                _logger.LogWarning($"User {user.GetUserId()} cannot update registration {registration.RegistrationId}. Access denied.");
                throw new NotAccessibleException($"User {user.GetUserId()} cannot update registration {registration.RegistrationId}");
            }

            var eventInfo = await _eventInfoRetrievalService.GetEventInfoByIdAsync(registration.EventInfoId, cancellationToken);
            _logger.LogInformation($"Retrieved event info for EventInfoId {eventInfo.EventInfoId}. Checking registration policy.");

            var registrationPolicy = eventInfo.Options.RegistrationPolicy;

            if (registrationPolicy.AllowedRegistrationEditHours != null)
            {
                var maxDuration = Duration.FromTimeSpan(TimeSpan.FromHours(registrationPolicy.AllowedRegistrationEditHours.Value));
                var currDuration = Instant.FromDateTimeOffset(DateTimeOffset.UtcNow) - registration.RegistrationTime;

                if (currDuration > maxDuration)
                {
                    _logger.LogWarning("Registration is too old to be updated. Access denied.");
                    throw new NotAccessibleException("Registration is too old to be updated.");
                }
            }

            if (!registrationPolicy.AllowModificationsAfterLastCancellationDate && eventInfo.LastCancellationDate != null)
            {
                if (DateTimeOffset.UtcNow > eventInfo.LastCancellationDate.Value.ToDateTimeUnspecified())
                {
                    _logger.LogWarning("Registration cannot be updated after event's last cancellation date. Access denied.");
                    throw new NotAccessibleException("Registration cannot be updated after event's last cancellation date.");
                }
            }

            _logger.LogInformation($"Update access granted for RegistrationId {registration.RegistrationId}");
        }


        public async Task<IQueryable<Registration>> AddAccessFilterAsync(IQueryable<Registration> query, CancellationToken cancellationToken)
        {
            var user = _httpContextAccessor.HttpContext.User;
            if (user.IsAnonymous()) { throw new NotAccessibleException("Anonymous users are not permitted to list any registrations."); }

            if (user.IsPowerAdmin())
            {
                return query; // super admins can ready any reg
            }

            if (!user.IsAdmin())
            {
                // non-admins can only read their own registrations
                return query.Where(r => r.UserId == user.GetUserId());
            }

            var org = await _currentOrganizationAccessorService.RequireCurrentOrganizationAsync(null, cancellationToken);

            return query.Where(r
                => r.EventInfo.OrganizationId == org.OrganizationId && r.EventInfo.Organization.Members.Any(m => m.UserId == user.GetUserId()));
        }

        private async Task<bool> CheckAdminAccessAsync(ClaimsPrincipal user, Registration registration, CancellationToken cancellationToken)
        {
            if (user.IsPowerAdmin()) { return true; }

            if (!user.IsAdmin()) { return false; }

            var org = await _currentOrganizationAccessorService.RequireCurrentOrganizationAsync(new OrganizationRetrievalOptions
            {
                LoadMembers = true
            },
                cancellationToken);

            if (org.Members.All(m => m.UserId != user.GetUserId())) { return false; }

            var @event = await _eventInfoRetrievalService.GetEventInfoByIdAsync(registration.EventInfoId, cancellationToken);
            return @event.OrganizationId == org.OrganizationId;
        }

        private async Task<bool> CheckOwnerOrAdminAccessAsync(ClaimsPrincipal user, Registration registration, CancellationToken cancellationToken)
        {
            if (user.IsAnonymous()) { return false; }

            if (registration.UserId == user.GetUserId()) { return true; }

            return await CheckAdminAccessAsync(user, registration, cancellationToken);
        }
    }
}