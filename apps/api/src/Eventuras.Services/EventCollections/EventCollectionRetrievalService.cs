using System;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.EventCollections;

public class EventCollectionRetrievalService : IEventCollectionRetrievalService
{
    private readonly ApplicationDbContext _context;
    private readonly IEventCollectionAccessControlService _eventCollectionAccessControlService;

    public EventCollectionRetrievalService(
        ApplicationDbContext context,
        IEventCollectionAccessControlService eventCollectionAccessControlService)
    {
        _context = context ?? throw
            new ArgumentNullException(nameof(context));

        _eventCollectionAccessControlService = eventCollectionAccessControlService ?? throw
            new ArgumentNullException(nameof(eventCollectionAccessControlService));
    }

    public async Task<Paging<EventCollection>> ListCollectionsAsync(
        EventCollectionListRequest request,
        EventCollectionRetrievalOptions options,
        CancellationToken cancellationToken)
    {
        request ??= new EventCollectionListRequest(0, 100);
        options ??= new EventCollectionRetrievalOptions();

        var query = _context.EventCollections
            .UseOptions(options)
            .UseFilter(request.Filter ?? new EventCollectionFilter())
            .UseOrder(request.Order, request.Descending);

        query = await _eventCollectionAccessControlService
            .AddAccessFilterAsync(query, cancellationToken);

        return await Paging.CreateAsync(query, request, cancellationToken);
    }

    public async Task<EventCollection> GetCollectionByIdAsync(int id,
        EventCollectionRetrievalOptions options,
        CancellationToken cancellationToken)
    {
        options ??= new EventCollectionRetrievalOptions();

        var collection = await _context.EventCollections
            .UseOptions(options)
            .FirstOrDefaultAsync(c => c.CollectionId == id, cancellationToken);

        if (collection == null)
        {
            throw new NotFoundException($"Collection {id} not found.");
        }

        if (options.ForUpdate)
        {
            await _eventCollectionAccessControlService
                .CheckEventCollectionUpdateAccessAsync(collection, cancellationToken);
        }

        return collection ?? throw
            new NotFoundException($"Collection {id} not found.");
    }
}
