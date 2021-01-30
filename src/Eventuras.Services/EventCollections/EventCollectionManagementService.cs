using Eventuras.Domain;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Infrastructure;
using Eventuras.Services.Auth;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.EventCollections
{
    internal class EventCollectionManagementService : IEventCollectionManagementService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;

        public EventCollectionManagementService(
            ApplicationDbContext context,
            IHttpContextAccessor httpContextAccessor,
            ICurrentOrganizationAccessorService currentOrganizationAccessorService)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
            _currentOrganizationAccessorService = currentOrganizationAccessorService ?? throw new ArgumentNullException(nameof(currentOrganizationAccessorService));
        }

        public async Task<EventCollection[]> ListCollectionsAsync(CancellationToken cancellationToken)
        {
            var query = _context.EventCollections
                .AsNoTracking()
                .OrderBy(c => c.Name) as IQueryable<EventCollection>;
            query = await AddOrgFilterIfNeededAsync(query, cancellationToken);
            return await query.ToArrayAsync(cancellationToken);
        }

        public async Task<EventCollection> GetCollectionByIdAsync(int id, CancellationToken cancellationToken)
        {
            var collection = await _context.EventCollections
                .AsNoTracking()
                .Where(c => c.CollectionId == id).FirstOrDefaultAsync(cancellationToken);
            return collection ?? throw new NotFoundException($"Collection {id} not found.");
        }

        public async Task CreateCollectionAsync(EventCollection collection, CancellationToken cancellationToken)
        {
            if (!await IsAccessibleForEditAsync(collection, cancellationToken))
            {
                throw new NotAccessibleException();
            }
            await _context.EventCollections.AddAsync(collection, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task UpdateCollectionAsync(EventCollection collection, CancellationToken cancellationToken)
        {
            if (!await IsAccessibleForEditAsync(collection, cancellationToken))
            {
                throw new NotAccessibleException();
            }
            await _context.UpdateAsync(collection, cancellationToken);
        }

        public async Task DeleteCollectionAsync(EventCollection collection, CancellationToken cancellationToken)
        {
            if (!await IsAccessibleForEditAsync(collection, cancellationToken))
            {
                throw new NotAccessibleException();
            }
            _context.EventCollections.Remove(collection);
            await _context.SaveChangesAsync(cancellationToken);
        }

        private async Task<bool> IsAccessibleForEditAsync(EventCollection collection, CancellationToken cancellationToken)
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
            var organization = await _currentOrganizationAccessorService
                .RequireCurrentOrganizationAsync(cancellationToken: cancellationToken);
            return collection.OrganizationId == organization.OrganizationId;
        }

        private async Task<IQueryable<EventCollection>> AddOrgFilterIfNeededAsync(
            IQueryable<EventCollection> query,
            CancellationToken cancellationToken)
        {
            var principal = _httpContextAccessor.HttpContext.User;
            if (principal.IsSuperAdmin() || principal.IsAnonymous())
            {
                return query;
            }
            var organization = await _currentOrganizationAccessorService
                .GetCurrentOrganizationAsync(cancellationToken: cancellationToken);
            return organization == null ? query : query.HavingOrganization(organization);
        }
    }
}
