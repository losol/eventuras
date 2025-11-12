using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Auth;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.Events;

public class EventInfoAccessControlService : IEventInfoAccessControlService
{
    private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;
    private readonly IEventInfoRetrievalService _eventInfoRetrievalService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<EventInfoAccessControlService> _logger;

    public EventInfoAccessControlService(
        IEventInfoRetrievalService eventInfoRetrievalService,
        ICurrentOrganizationAccessorService currentOrganizationAccessorService,
        IHttpContextAccessor httpContextAccessor,
        ILogger<EventInfoAccessControlService> logger)
    {
        _eventInfoRetrievalService = eventInfoRetrievalService ?? throw
            new ArgumentNullException(nameof(eventInfoRetrievalService));

        _currentOrganizationAccessorService = currentOrganizationAccessorService ?? throw
            new ArgumentNullException(nameof(currentOrganizationAccessorService));

        _httpContextAccessor = httpContextAccessor ?? throw
            new ArgumentNullException(nameof(httpContextAccessor));

        _logger = logger ?? throw
            new ArgumentNullException(nameof(logger));
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

    public async Task CheckEventManageAccessAsync(EventInfo eventInfo, CancellationToken cancellationToken = default)
    {
        if (eventInfo == null)
        {
            _logger.LogWarning("No EventInfo provided for access control");
            throw new ArgumentNullException(nameof(eventInfo));
        }

        var user = _httpContextAccessor.HttpContext.User;
        if (user.IsPowerAdmin())
        {
            _logger.LogInformation("Power admin {UserId} can manage any event", user.GetUserId());
            return;
        }

        if (!user.IsAdmin())
        {
            _logger.LogWarning("User {UserId} is not admin and cannot manage event {EventInfoId}", user.GetUserId(),
                eventInfo.EventInfoId);
            throw new NotAccessibleException(
                $"Event {eventInfo.EventInfoId} is not accessible for update by user {user.GetUserId()}");
        }

        var org = await _currentOrganizationAccessorService
            .RequireCurrentOrganizationAsync(new OrganizationRetrievalOptions { LoadMembers = true },
                cancellationToken);

        if (eventInfo.OrganizationId != org.OrganizationId)
        {
            _logger.LogWarning(
                $"Event {eventInfo.EventInfoId} is not accessible from organization {org.OrganizationId}");
            throw new NotAccessibleException(
                $"Event {eventInfo.EventInfoId} is not accessible from organization {org.OrganizationId}");
        }

        if (org.Members.All(m => m.UserId != user.GetUserId() || !m.HasRole(Roles.Admin)))
        {
            _logger.LogWarning($"User {user.GetUserId()} is not admin of organization {org.OrganizationId}");
            throw new NotAccessibleException(
                $"Event {eventInfo.EventInfoId} is not accessible for update by user {user.GetUserId()}");
        }
    }
}
