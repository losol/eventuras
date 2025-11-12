using System;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Auth;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.EventCollections;

internal class EventCollectionMappingService : IEventCollectionMappingService
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<EventCollectionMappingService> _logger;

    public EventCollectionMappingService(
        ApplicationDbContext context,
        IHttpContextAccessor httpContextAccessor,
        ICurrentOrganizationAccessorService currentOrganizationAccessorService,
        ILogger<EventCollectionMappingService> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        _currentOrganizationAccessorService = currentOrganizationAccessorService ??
                                              throw new ArgumentNullException(
                                                  nameof(currentOrganizationAccessorService));
    }

    public async Task AddEventToCollectionAsync(int eventId, int collectionId, CancellationToken cancellationToken)
    {
        var mapping = await CheckAndFindMappingAsync(eventId, collectionId, cancellationToken);
        if (mapping != null)
        {
            return;
        }

        mapping = new EventCollectionMapping { EventId = eventId, CollectionId = collectionId };

        try
        {
            await _context.CreateAsync(mapping, cancellationToken: cancellationToken);
        }
        catch (DbUpdateException e) when (e.IsUniqueKeyViolation())
        {
            _context.EventCollectionMappings.Remove(mapping);
            // all good, mapping already exists
        }
        catch (DbUpdateException e) when (e.IsForeignKeyViolation())
        {
            // event or collection not exists
            _logger.LogError(e,
                "Failed to map event {eventId} to collection {collectionId}",
                eventId, collectionId);
            throw new NotFoundException();
        }
    }

    public async Task RemoveEventFromCollectionAsync(int eventId, int collectionId, CancellationToken cancellationToken)
    {
        var mapping = await CheckAndFindMappingAsync(eventId, collectionId, cancellationToken);
        if (mapping != null)
        {
            _context.EventCollectionMappings.Remove(mapping);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    private async Task<EventCollectionMapping> CheckAndFindMappingAsync(int eventId, int collectionId,
        CancellationToken cancellationToken)
    {
        var @event = await _context.EventInfos
            .FirstOrDefaultAsync(e => e.EventInfoId == eventId,
                cancellationToken);
        if (@event == null)
        {
            throw new NotFoundException($"Event {eventId} not found");
        }

        var collection = await _context.EventCollections
            .FirstOrDefaultAsync(c => c.CollectionId == collectionId,
                cancellationToken);
        if (collection == null)
        {
            throw new NotFoundException($"Event collection {collectionId} not found");
        }

        if (!await IsAccessibleForEditAsync(@event.OrganizationId, cancellationToken))
        {
            throw new NotAccessibleException($"Event {eventId} not accessible not accessible for update");
        }

        if (!await IsAccessibleForEditAsync(collection.OrganizationId, cancellationToken))
        {
            throw new NotAccessibleException($"Collection {collectionId} not accessible for update");
        }

        var mapping = await _context.EventCollectionMappings
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.EventId == eventId
                                      && m.CollectionId == collectionId,
                cancellationToken);
        return mapping;
    }

    private async Task<bool> IsAccessibleForEditAsync(int organizationId, CancellationToken cancellationToken)
    {
        var principal = _httpContextAccessor.HttpContext.User;
        if (!principal.IsAdmin())
        {
            return false;
        }

        if (principal.IsPowerAdmin())
        {
            return true;
        }

        var organization = await _currentOrganizationAccessorService
            .RequireCurrentOrganizationAsync(cancellationToken: cancellationToken);
        return organizationId == organization.OrganizationId;
    }
}
