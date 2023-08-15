using System;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;

namespace Eventuras.Services.EventCollections;

internal class EventCollectionManagementService : IEventCollectionManagementService
{
    private readonly ApplicationDbContext _context;
    private readonly IEventCollectionAccessControlService _eventCollectionAccessControlService;

    public EventCollectionManagementService(ApplicationDbContext context, IEventCollectionAccessControlService eventCollectionAccessControlService)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));

        _eventCollectionAccessControlService =
            eventCollectionAccessControlService ?? throw new ArgumentNullException(nameof(eventCollectionAccessControlService));
    }

    public async Task CreateCollectionAsync(EventCollection collection, CancellationToken cancellationToken)
    {
        await _eventCollectionAccessControlService.CheckEventCollectionUpdateAccessAsync(collection, cancellationToken);

        await _context.CreateAsync(collection, cancellationToken: cancellationToken);
    }

    public async Task UpdateCollectionAsync(EventCollection collection, CancellationToken cancellationToken)
    {
        await _eventCollectionAccessControlService.CheckEventCollectionUpdateAccessAsync(collection, cancellationToken);

        await _context.UpdateAsync(collection, cancellationToken);
    }

    public async Task ArchiveCollectionAsync(EventCollection collection, CancellationToken cancellationToken)
    {
        await _eventCollectionAccessControlService.CheckEventCollectionUpdateAccessAsync(collection, cancellationToken);

        collection.Archived = true;
        await _context.UpdateAsync(collection, cancellationToken);
    }
}