using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Eventuras.Services.Events
{
    internal class EventInfoRetrievalService : IEventInfoRetrievalService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;

        public EventInfoRetrievalService(
            ApplicationDbContext context,
            ICurrentOrganizationAccessorService currentOrganizationAccessorService,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _currentOrganizationAccessorService = currentOrganizationAccessorService ?? throw new ArgumentNullException(nameof(currentOrganizationAccessorService));
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        }

        public async Task<EventInfo> GetEventInfoByIdAsync(int id, EventInfoRetrievalOptions options = null)
        {
            var query = _context.EventInfos
                .AsNoTracking()
                .Where(e => e.EventInfoId == id)
                .UseOptions(options ?? new EventInfoRetrievalOptions());

            return await query.SingleAsync();
        }

        public async Task<List<EventInfo>> ListEventsAsync(
            EventInfoFilter filter = null,
            EventRetrievalOrder order = EventRetrievalOrder.StartDate,
            EventInfoRetrievalOptions options = null)
        {
            var query = _context.EventInfos.AsNoTracking()
                .UseOptions(options ?? new EventInfoRetrievalOptions())
                .UseFilter(filter ?? new EventInfoFilter())
                .UseOrder(order);

            query = await AddOrgFilterIfNeededAsync(query);

            return await query.ToListAsync();
        }

        private async Task<IQueryable<EventInfo>> AddOrgFilterIfNeededAsync(IQueryable<EventInfo> query)
        {
            var principal = _httpContextAccessor.HttpContext.User;

            if (!principal.Identity.IsAuthenticated)
            {
                var organization = await _currentOrganizationAccessorService.GetCurrentOrganizationAsync();
                return organization?.IsRoot == true
                    ? query
                    : query.HavingNoOrganizationOr(organization);
            }

            if (!principal.IsInRole(Roles.SuperAdmin))
            {
                var organization = await _currentOrganizationAccessorService.GetCurrentOrganizationAsync();
                return principal.IsInRole(Roles.Admin)
                    ? query.HavingOrganization(organization) // admins can't manage no-org events
                    : query.HavingNoOrganizationOr(organization);
            }

            return query;
        }
    }
}
