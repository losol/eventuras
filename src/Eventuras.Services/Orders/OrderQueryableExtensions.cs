using Eventuras.Domain;
using System;
using System.Linq;

namespace Eventuras.Services.Orders
{
    internal static class OrderQueryableExtensions
    {
        public static IQueryable<Order> HavingOrganization(this IQueryable<Order> query, Organization organization)
        {
            if (organization == null)
                throw new ArgumentNullException(nameof(organization));

            return query.Where(o => o.Registration.EventInfo.OrganizationId == organization.OrganizationId);
        }

        public static IQueryable<Order> HavingNoOrganization(this IQueryable<Order> query)
        {
            return query.HavingNoOrganizationOr();
        }

        public static IQueryable<Order> HavingNoOrganizationOr(this IQueryable<Order> query, Organization organization = null)
        {
            if (organization != null)
            {
                query = query.Where(e => e.Registration.EventInfo.OrganizationId == null ||
                                         e.Registration.EventInfo.OrganizationId == organization.OrganizationId);
            }
            else
            {
                query = query.Where(e => e.Registration.EventInfo.OrganizationId == null);
            }

            return query;
        }
    }
}
