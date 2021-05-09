using Eventuras.Domain;
using Eventuras.Services.Auth;
using Eventuras.Services.Exceptions;
using Microsoft.AspNetCore.Http;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Services.Events;
using Eventuras.Services.Organizations;

namespace Eventuras.Services.Registrations
{
    internal class RegistrationAccessControlService : IRegistrationAccessControlService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IEventInfoRetrievalService _eventInfoRetrievalService;
        private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;

        public RegistrationAccessControlService(
            IHttpContextAccessor httpContextAccessor,
            IEventInfoRetrievalService eventInfoRetrievalService,
            ICurrentOrganizationAccessorService currentOrganizationAccessorService)
        {
            _httpContextAccessor = httpContextAccessor ?? throw
                new ArgumentNullException(nameof(httpContextAccessor));

            _eventInfoRetrievalService = eventInfoRetrievalService ?? throw
                new ArgumentNullException(nameof(eventInfoRetrievalService));

            _currentOrganizationAccessorService = currentOrganizationAccessorService ?? throw
                new ArgumentNullException(nameof(currentOrganizationAccessorService));
        }

        public async Task CheckRegistrationReadAccessAsync(
            Registration registration,
            CancellationToken cancellationToken)
        {
            var user = _httpContextAccessor.HttpContext.User;
            if (!await CheckOwnerOrAdminAccessAsync(user, registration, cancellationToken))
            {
                throw new NotAccessibleException($"User {user.GetUserId()} cannot read registration {registration.RegistrationId}");
            }
        }

        public async Task CheckRegistrationCreateAccessAsync(
            Registration registration,
            CancellationToken cancellationToken)
        {
            var user = _httpContextAccessor.HttpContext.User;
            var eventInfo = await _eventInfoRetrievalService.GetEventInfoByIdAsync(registration.EventInfoId, cancellationToken);

            // Add possibility for organizaton admin to override later
            if (!user.IsSystemAdmin() && eventInfo.Status != EventInfo.EventInfoStatus.RegistrationsOpen) {
                throw new NotAccessibleException($"Registrations are closed for event {eventInfo.Title} with id {eventInfo.EventInfoId}.");
            }

            if (!await CheckOwnerOrAdminAccessAsync(user, registration, cancellationToken))
            {
                throw new NotAccessibleException($"User {user.GetUserId()} cannot create registration for event {registration.EventInfoId} and user {registration.UserId}");
            }
        }

        public async Task CheckRegistrationUpdateAccessAsync(
            Registration registration,
            CancellationToken cancellationToken)
        {
            var user = _httpContextAccessor.HttpContext.User;
            if (!await CheckAdminAccessAsync(user, registration, cancellationToken))
            {
                throw new NotAccessibleException($"User {user.GetUserId()} cannot update registration {registration.RegistrationId}");
            }
        }

        public async Task<IQueryable<Registration>> AddAccessFilterAsync(
            IQueryable<Registration> query,
            CancellationToken cancellationToken)
        {
            var user = _httpContextAccessor.HttpContext.User;
            if (user.IsAnonymous())
            {
                throw new NotAccessibleException("Anonymous users are not permitted to list any registrations.");
            }

            if (user.IsSystemAdmin() || user.IsSuperAdmin())
            {
                return query; // super admins can ready any reg
            }

            if (!user.IsAdmin())
            {
                // non-admins can only read their own registrations
                return query.Where(r => r.UserId == user.GetUserId());
            }

            var org = await _currentOrganizationAccessorService.RequireCurrentOrganizationAsync(null, cancellationToken);
            return query.Where(r => r.EventInfo.OrganizationId == org.OrganizationId &&
                                    r.EventInfo.Organization.Members
                                        .Any(m => m.UserId == user.GetUserId())); // FIXME: it's not true anymore that if the user is Admin then he is an Admin of the current org.
        }

        private async Task<bool> CheckAdminAccessAsync(
            ClaimsPrincipal user,
            Registration registration,
            CancellationToken cancellationToken)
        {
            if (user.IsSystemAdmin() || user.IsSuperAdmin())
            {
                return true;
            }

            if (!user.IsAdmin())
            {
                return false;
            }

            var org = await _currentOrganizationAccessorService.RequireCurrentOrganizationAsync(new OrganizationRetrievalOptions
            {
                LoadMembers = true
            }, cancellationToken);

            if (org.Members.All(m => m.UserId != user.GetUserId()))
            {
                return false;
            }

            var @event = await _eventInfoRetrievalService.GetEventInfoByIdAsync(registration.EventInfoId, cancellationToken);
            return @event.OrganizationId == org.OrganizationId;
        }

        private async Task<bool> CheckOwnerOrAdminAccessAsync(
            ClaimsPrincipal user,
            Registration registration,
            CancellationToken cancellationToken)
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
}
