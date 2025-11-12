using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Auth;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Events;

internal class EventInfoRetrievalService : IEventInfoRetrievalService
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public EventInfoRetrievalService(
        ApplicationDbContext context,
        ICurrentOrganizationAccessorService currentOrganizationAccessorService,
        IHttpContextAccessor httpContextAccessor)
    {
        _context = context ?? throw
            new ArgumentNullException(nameof(context));

        _currentOrganizationAccessorService = currentOrganizationAccessorService ?? throw
            new ArgumentNullException(nameof(currentOrganizationAccessorService));

        _httpContextAccessor = httpContextAccessor ?? throw
            new ArgumentNullException(nameof(httpContextAccessor));
    }

    public async Task<EventInfo> GetEventInfoByIdAsync(int id,
        EventInfoRetrievalOptions options,
        CancellationToken cancellationToken) =>
        await _context.EventInfos
            .UseOptions(options ?? new EventInfoRetrievalOptions())
            .FirstOrDefaultAsync(e => e.EventInfoId == id, cancellationToken)
        ?? throw new NotFoundException($"Event {id} not found");

    public async Task<Paging<EventInfo>> ListEventsAsync(
        EventListRequest request,
        EventInfoRetrievalOptions options,
        CancellationToken cancellationToken)
    {
        var query = _context.EventInfos
            .AsNoTracking()
            .UseOptions(options ?? new EventInfoRetrievalOptions())
            .UseFilter(request.Filter)
            .UseOrder(request.Ordering);

        if (request.Filter.AccessibleOnly)
        {
            query = await AddOrgFilterIfNeededAsync(query, cancellationToken);
        }

        return await Paging.CreateAsync(query, request, cancellationToken);
    }

    private async Task<IQueryable<EventInfo>> AddOrgFilterIfNeededAsync(
        IQueryable<EventInfo> query,
        CancellationToken cancellationToken)
    {
        var principal = _httpContextAccessor.HttpContext!.User;
        if (principal.IsAnonymous())
        {
            var organization = await _currentOrganizationAccessorService
                .GetCurrentOrganizationAsync(null, cancellationToken);

            return organization?.IsRoot == true
                ? query
                : query.HavingOrganization(organization);
        }

        if (!principal.IsPowerAdmin())
        {
            var organization = await _currentOrganizationAccessorService
                .GetCurrentOrganizationAsync(null, cancellationToken);

            return query.HavingOrganization(organization);
        }

        return query;
    }
}
