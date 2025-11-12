using System;
using System.Linq;
using Eventuras.Domain;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.EventCollections;

internal static class EventCollectionQueryableExtensions
{
    public static IQueryable<EventCollection> UseOrder(
        this IQueryable<EventCollection> query,
        EventCollectionOrder order,
        bool descending)
    {
        switch (order)
        {
            case EventCollectionOrder.Name:
                query = descending
                    ? query.OrderByDescending(c => c.Name)
                    : query.OrderBy(c => c.Name);
                break;
        }

        return query;
    }

    public static IQueryable<EventCollection> UseFilter(
        this IQueryable<EventCollection> query,
        EventCollectionFilter filter)
    {
        if (filter == null)
        {
            throw new ArgumentNullException(nameof(filter));
        }

        if (!filter.IncludeArchived)
        {
            query = query.Where(c => !c.Archived);
        }

        if (filter.EventInfoId.HasValue)
        {
            query = query.Where(c => c.EventMappings
                .Any(m => m.EventId == filter.EventInfoId));
        }

        return query;
    }

    public static IQueryable<EventCollection> UseOptions(
        this IQueryable<EventCollection> query,
        EventCollectionRetrievalOptions options)
    {
        if (options == null)
        {
            throw new ArgumentNullException(nameof(options));
        }

        if (!options.ForUpdate)
        {
            query = query.AsNoTracking();
        }

        if (options.LoadEvents)
        {
            query = query.Include(c => c.Events);
        }

        if (options.LoadMappings)
        {
            query = query.Include(c => c.EventMappings);
        }

        return query;
    }

    public static IQueryable<EventCollection> HavingOrganization(this IQueryable<EventCollection> query,
        Organization organization)
    {
        if (organization == null)
        {
            throw new ArgumentNullException(nameof(organization));
        }

        return query.Where(e => e.OrganizationId == organization.OrganizationId);
    }
}
