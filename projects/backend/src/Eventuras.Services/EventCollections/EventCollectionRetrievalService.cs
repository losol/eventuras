using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Exceptions;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.EventCollections
{
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

        public async Task<EventCollection[]> ListCollectionsAsync(
            EventCollectionListRequest request,
            EventCollectionRetrievalOptions options,
            CancellationToken cancellationToken)
        {
            request ??= new EventCollectionListRequest();
            options ??= new EventCollectionRetrievalOptions();

            var query = _context.EventCollections
                .UseOptions(options ?? new EventCollectionRetrievalOptions())
                .UseFilter(request.Filter ?? new EventCollectionFilter())
                .UseOrder(request.Order, request.Descending);

            query = await _eventCollectionAccessControlService
                .AddAccessFilterAsync(query, cancellationToken);

            return await query.ToArrayAsync(cancellationToken);
        }

        public async Task<EventCollection> GetCollectionByIdAsync(int id,
            EventCollectionRetrievalOptions options,
            CancellationToken cancellationToken)
        {
            options ??= new EventCollectionRetrievalOptions();

            var collection = await _context.EventCollections
                .UseOptions(options)
                .FirstOrDefaultAsync(c => c.CollectionId == id, cancellationToken);

            if (options.ForUpdate)
            {
                await _eventCollectionAccessControlService
                    .CheckEventCollectionUpdateAccessAsync(collection, cancellationToken);
            }

            return collection ?? throw
                new NotFoundException($"Collection {id} not found.");
        }
    }
}
