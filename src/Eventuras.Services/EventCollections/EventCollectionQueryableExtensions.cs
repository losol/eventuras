using Eventuras.Domain;
using System;
using System.Linq;

namespace Eventuras.Services.EventCollections
{
    internal static class EventCollectionQueryableExtensions
    {
        public static IQueryable<EventCollection> HavingOrganization(this IQueryable<EventCollection> query, Organization organization)
        {
            if (organization == null)
                throw new ArgumentNullException(nameof(organization));

            return query.Where(e => e.OrganizationId == organization.OrganizationId);
        }
    }
}
