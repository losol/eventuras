using Eventuras.Domain;
using System;
using System.Linq;
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
                    i.DateStart.HasValue && i.DateEnd.HasValue && i.DateStart.Value.Date <= DateTime.Now.Date && i.DateEnd.Value.Date >= DateTime.Now.Date);
            }

            if (filter.StartDateAfter.HasValue)
            {
                query = query.Where(e => e.DateStart >= filter.StartDateAfter);
            }

            return query;
        }

        public static IQueryable<EventInfo> UseOptions(this IQueryable<EventInfo> query, EventInfoRetrievalOptions options)
        {
            if (options == null)
            {
                throw new ArgumentNullException(nameof(options));
            }

            if (options.LoadOrganizerUser)
            {
                query = query.Include(e => e.OrganizerUser);
            }

            if (options.LoadOrganization)
            {
                query = query.Include(e => e.Organization);
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

        public static IQueryable<EventInfo> HavingOrganization(this IQueryable<EventInfo> query, Organization organization)
        {
            if (organization == null)
                throw new ArgumentNullException(nameof(organization));

            return query.Where(e => e.OrganizationId == organization.OrganizationId);
        }

        public static IQueryable<EventInfo> HavingNoOrganization(this IQueryable<EventInfo> query)
        {
            return HavingNoOrganizationOr(query, null);
        }

        public static IQueryable<EventInfo> HavingNoOrganizationOr(this IQueryable<EventInfo> query, Organization organization = null)
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
