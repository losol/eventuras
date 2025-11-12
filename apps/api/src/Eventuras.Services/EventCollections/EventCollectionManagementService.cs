using System;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.EventCollections;

internal class EventCollectionManagementService : IEventCollectionManagementService
{
    private readonly ApplicationDbContext _context;
    private readonly IEventCollectionAccessControlService _eventCollectionAccessControlService;
    private readonly ILogger<EventCollectionManagementService> _logger;

    public EventCollectionManagementService(
        ApplicationDbContext context,
        IEventCollectionAccessControlService eventCollectionAccessControlService,
        ILogger<EventCollectionManagementService> logger)
    {
        _context = context ?? throw
            new ArgumentNullException(nameof(context));

        _eventCollectionAccessControlService = eventCollectionAccessControlService ?? throw
            new ArgumentNullException(nameof(eventCollectionAccessControlService));

        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task CreateCollectionAsync(EventCollection collection, CancellationToken cancellationToken)
    {
        if (await _context.EventCollections.AnyAsync(e => e.Slug == collection.Slug, cancellationToken))
        {
            _logger.LogError("Duplicate slug, cannot create event");
            throw new DuplicateException($"EventCollection with slug {collection.Slug} already exists");
        }

        await _eventCollectionAccessControlService
            .CheckEventCollectionUpdateAccessAsync(collection,
                cancellationToken);

        await _context.CreateAsync(collection, cancellationToken: cancellationToken);
    }

    public async Task UpdateCollectionAsync(EventCollection collection, CancellationToken cancellationToken)
    {
        await _eventCollectionAccessControlService
            .CheckEventCollectionUpdateAccessAsync(collection,
                cancellationToken);

        await _context.UpdateAsync(collection, cancellationToken);
    }

    public async Task ArchiveCollectionAsync(EventCollection collection, CancellationToken cancellationToken)
    {
        await _eventCollectionAccessControlService
            .CheckEventCollectionUpdateAccessAsync(collection,
                cancellationToken);

        collection.Archived = true;
        await _context.UpdateAsync(collection, cancellationToken);
    }
}
