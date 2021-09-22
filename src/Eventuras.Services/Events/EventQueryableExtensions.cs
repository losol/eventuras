using System;
using System.Linq;
using Eventuras.Domain;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Events
{
    internal static class EventQueryableExtensions
    {
        public static IQueryable<EventInfo> UseFilter(this IQueryable<EventInfo> query, EventInfoFilter filter)
        {
            if (filter == null)
            {
                throw new ArgumentNullException(nameof(filter));
            }

            if (!filter.IncludeArchived)
            {
                query = query.Where(e => !e.Archived);
            }

            if (filter.StatusOneOf?.Any() == true)
            {
                query = query.Where(e => filter.StatusOneOf.Contains(e.Status));
            }

            if (filter.StatusNoneOf?.Any() == true)
            {
                query = query.Where(e => !filter.StatusNoneOf.Contains(e.Status));
            }

            if (filter.TypeOneOf?.Any() == true)
            {
                query = query.Where(e => filter.TypeOneOf.Contains(e.Type));
            }

            if (filter.TypeNoneOf?.Any() == true)
            {
                query = query.Where(e => !filter.TypeNoneOf.Contains(e.Type));
            }

            if (filter.FeaturedOnly)
            {
                query = query.Where(e => e.Featured);
            }

            if (filter.PastEventsOnly)
            {
                query = query.Where(e => e.DateStart <= DateTime.Now || !e.DateStart.HasValue);
            }

            if (filter.TodaysEventsOnly)
            {
                query = query.Where(i =>
                    i.DateStart.HasValue && i.DateStart.Value.Date == DateTime.Now.Date ||
                    i.DateStart.HasValue && i.DateEnd.HasValue && i.DateStart.Value.Date <= DateTime.Now.Date &&
                    i.DateEnd.Value.Date >= DateTime.Now.Date);
            }

            if (filter.StartDate.HasValue)
            {
                query = query.Where(e => e.DateStart == filter.StartDate);
            }

            if (filter.EndDate.HasValue)
            {
                query = query.Where(e => e.DateEnd == filter.EndDate);
            }

            if (filter.StartDateBefore.HasValue)
            {
                query = query.Where(e => e.DateStart <= filter.StartDateBefore);
            }

            if (filter.StartDateAfter.HasValue)
            {
                query = query.Where(e => e.DateStart >= filter.StartDateAfter);
            }

            if (filter.EndDateIsNullOrBefore.HasValue)
            {
                query = query.Where(e => !e.DateEnd.HasValue || e.DateEnd <= filter.EndDateIsNullOrBefore);
            }

            if (filter.EndDateIsNullOrAfter.HasValue)
            {
                query = query.Where(e => !e.DateEnd.HasValue || e.DateEnd >= filter.EndDateIsNullOrAfter);
            }

            if (filter.EndDateBefore.HasValue)
            {
                query = query.Where(e => e.DateEnd <= filter.EndDateBefore);
            }

            if (filter.EndDateAfter.HasValue)
            {
                query = query.Where(e => e.DateEnd >= filter.EndDateAfter);
            }

            if (filter.CollectionIds?.Any() == true)
            {
                query = query.Where(e => e.CollectionMappings
                    .Any(m => filter.CollectionIds
                        .Contains(m.CollectionId)));
            }

            if (filter.OrganizationId.HasValue)
            {
                query = query.Where(e => e.OrganizationId == filter.OrganizationId.Value);
            }

            return query;
        }

        public static IQueryable<EventInfo> UseOptions(this IQueryable<EventInfo> query,
            EventInfoRetrievalOptions options)
        {
            if (options == null)
            {
                throw new ArgumentNullException(nameof(options));
            }

            if (!options.ForUpdate)
            {
                query = query.AsNoTracking();
            }

            if (options.LoadOrganizerUser)
            {
                query = query.Include(e => e.OrganizerUser);
            }

            if (options.LoadOrganization)
            {
                var includableQueryable = query.Include(e => e.Organization);
                if (options.LoadOrganizationMembers)
                {
                    includableQueryable.ThenInclude(o => o.Members);
                }

                query = includableQueryable;
            }

            if (options.LoadProducts)
            {
                query = query
                    .Include(e => e.Products)
                    .ThenInclude(p => p.ProductVariants);
            }

            if (options.LoadRegistrations)
            {
                query = query.Include(e => e.Registrations);
            }
            
            if (options.LoadCollections)
            {
                query = query.Include(e => e.Collections);
            }

            return query;
        }

        public static IQueryable<EventInfo> UseOrder(this IQueryable<EventInfo> query, EventRetrievalOrder order)
        {
            switch (order)
            {
                case EventRetrievalOrder.Title:
                    query = query.OrderBy(e => e.Title);
                    break;

                default:
                    query = query.OrderBy(e => e.DateStart);
                    break;
            }

            return query;
        }

        public static IQueryable<EventInfo> HavingOrganization(this IQueryable<EventInfo> query,
            Organization organization)
        {
            if (organization == null)
                throw new ArgumentNullException(nameof(organization));

            return query.Where(e => e.OrganizationId == organization.OrganizationId);
        }

        public static IQueryable<EventInfo> HavingNoOrganization(this IQueryable<EventInfo> query)
        {
            return HavingNoOrganizationOr(query, null);
        }

        public static IQueryable<EventInfo> HavingNoOrganizationOr(this IQueryable<EventInfo> query,
            Organization organization = null)
        {
            if (organization != null)
            {
                query = query.Where(e => e.OrganizationId == null ||
                                         e.OrganizationId == organization.OrganizationId);
            }
            else
            {
                query = query.Where(e => e.OrganizationId == null);
            }

            return query;
        }
    }
}
