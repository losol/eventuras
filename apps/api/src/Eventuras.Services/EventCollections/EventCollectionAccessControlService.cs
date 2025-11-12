using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Auth;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Http;

namespace Eventuras.Services.EventCollections;

public class EventCollectionAccessControlService : IEventCollectionAccessControlService
{
    private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public EventCollectionAccessControlService(
        IHttpContextAccessor httpContextAccessor,
        ICurrentOrganizationAccessorService currentOrganizationAccessorService)
    {
        _httpContextAccessor = httpContextAccessor ?? throw
            new ArgumentNullException(nameof(httpContextAccessor));

        _currentOrganizationAccessorService = currentOrganizationAccessorService ?? throw
            new ArgumentNullException(nameof(currentOrganizationAccessorService));
    }

    public Task CheckEventCollectionReadAccessAsync(
        EventCollection collection,
        CancellationToken cancellationToken = default) =>
        Task.CompletedTask; // anyone can read any collection for now 

    public async Task CheckEventCollectionUpdateAccessAsync(
        EventCollection collection,
        CancellationToken cancellationToken = default)
    {
        var principal = _httpContextAccessor.HttpContext.User;
        if (!principal.IsAdmin())
        {
            throw new NotAccessibleException("Event collection may be updated by admin only.");
        }

        if (principal.IsPowerAdmin())
        {
            return;
        }

        var organization = await _currentOrganizationAccessorService
            .RequireCurrentOrganizationAsync(cancellationToken: cancellationToken);

        if (collection.OrganizationId != organization.OrganizationId)
        {
            throw new NotAccessibleException(
                $"Event collection {collection.CollectionId} is not available for update.");
        }
    }

    public async Task<IQueryable<EventCollection>> AddAccessFilterAsync(
        IQueryable<EventCollection> query,
        CancellationToken cancellationToken = default)
    {
        var principal = _httpContextAccessor.HttpContext.User;
        if (principal.IsPowerAdmin() || principal.IsAnonymous())
        {
            return query;
        }

        var organization = await _currentOrganizationAccessorService
            .GetCurrentOrganizationAsync(cancellationToken: cancellationToken);
        return organization == null ? query : query.HavingOrganization(organization);
    }
}
