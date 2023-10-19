using Eventuras.Domain;
using Eventuras.Services.Auth;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Http;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.Events
{
    public class EventInfoAccessControlService : IEventInfoAccessControlService
    {
        private readonly IEventInfoRetrievalService _eventInfoRetrievalService;
        private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public EventInfoAccessControlService(
            IEventInfoRetrievalService eventInfoRetrievalService,
            ICurrentOrganizationAccessorService currentOrganizationAccessorService,
            IHttpContextAccessor httpContextAccessor)
        {
            _eventInfoRetrievalService = eventInfoRetrievalService ?? throw
                new ArgumentNullException(nameof(eventInfoRetrievalService));

            _currentOrganizationAccessorService = currentOrganizationAccessorService ?? throw
                new ArgumentNullException(nameof(currentOrganizationAccessorService));

            _httpContextAccessor = httpContextAccessor ?? throw
                new ArgumentNullException(nameof(httpContextAccessor));
        }

        public Task CheckEventReadAccessAsync(EventInfo eventInfo, CancellationToken token)
        {
            if (eventInfo == null)
            {
                throw new ArgumentNullException(nameof(eventInfo));
            }

            // For now, anyone can read any event information.
            return Task.CompletedTask;
        }

        public async Task CheckEventManageAccessAsync(EventInfo eventInfo, CancellationToken token)
        {
            if (eventInfo == null)
            {
                throw new ArgumentNullException(nameof(eventInfo));
            }

            var user = _httpContextAccessor.HttpContext.User;
            if (user.IsPowerAdmin())
            {
                return;
            }

            if (!user.IsAdmin())
            {
                throw new NotAccessibleException(
                    $"Event {eventInfo.EventInfoId} is not accessible for update by user {user.GetUserId()}");
            }

            var org = await _currentOrganizationAccessorService
                .RequireCurrentOrganizationAsync(new OrganizationRetrievalOptions
                {
                    LoadMembers = true
                }, token);

            if (eventInfo.OrganizationId != org.OrganizationId)
            {
                throw new NotAccessibleException(
                    $"Event {eventInfo.EventInfoId} is not accessible from organization {org.OrganizationId}");
            }

            if (org.Members.All(m => m.UserId != user.GetUserId() || !m.HasRole(Roles.Admin)))
            {
                throw new NotAccessibleException(
                    $"Event {eventInfo.EventInfoId} is not accessible for update by user {user.GetUserId()}");
            }
        }
    }
}
