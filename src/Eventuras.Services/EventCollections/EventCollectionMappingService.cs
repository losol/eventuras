using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using Eventuras.Services.Auth;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.EventCollections
{
    internal class EventCollectionMappingService : IEventCollectionMappingService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;
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
            _currentOrganizationAccessorService = currentOrganizationAccessorService ?? throw new ArgumentNullException(nameof(currentOrganizationAccessorService));
        }

        public async Task AddEventToCollectionAsync(int eventId, int collectionId)
        {
            var mapping = await CheckAndFindMappingAsync(eventId, collectionId);
            if (mapping != null)
            {
                return;
            }

            mapping = new EventCollectionMapping
            {
                EventId = eventId,
                CollectionId = collectionId
            };

            try
            {
                await _context.EventCollectionMappings.AddAsync(mapping);
                await _context.SaveChangesAsync();
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

        public async Task RemoveEventFromCollectionAsync(int eventId, int collectionId)
        {
            var mapping = await CheckAndFindMappingAsync(eventId, collectionId);
            if (mapping != null)
            {
                _context.EventCollectionMappings.Remove(mapping);
                await _context.SaveChangesAsync();
            }
        }

        private async Task<EventCollectionMapping> CheckAndFindMappingAsync(int eventId, int collectionId)
        {
            var @event = await _context.EventInfos.FirstOrDefaultAsync(e => e.EventInfoId == eventId);
            if (@event == null)
            {
                throw new NotFoundException($"Event {eventId} not found");
            }

            var collection = await _context.EventCollections.FirstOrDefaultAsync(c => c.CollectionId == collectionId);
            if (collection == null)
            {
                throw new NotFoundException($"Event collection {collectionId} not found");
            }

            if (@event.OrganizationId.HasValue && !await IsAccessibleForEditAsync(@event.OrganizationId.Value))
            {
                throw new NotAccessibleException($"Event {eventId} not accessible not accessible for update");
            }

            if (!await IsAccessibleForEditAsync(collection.OrganizationId))
            {
                throw new NotAccessibleException($"Collection {collectionId} not accessible for update");
            }

            var mapping = await _context.EventCollectionMappings
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.EventId == eventId
                                          && m.CollectionId == collectionId);
            return mapping;
        }

        private async Task<bool> IsAccessibleForEditAsync(int organizationId)
        {
            var principal = _httpContextAccessor.HttpContext.User;
            if (!principal.IsAdmin())
            {
                return false;
            }
            if (principal.IsSuperAdmin())
            {
                return true;
            }
            var organization = await _currentOrganizationAccessorService.GetCurrentOrganizationAsync();
            return organizationId == organization.OrganizationId;
        }
    }
}
