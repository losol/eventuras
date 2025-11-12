using System;
using System.Linq;
using Eventuras.Domain;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Events.Products;

internal static class ProductsQueryableExtensions
{
    public static IQueryable<Product> UseFilter(this IQueryable<Product> query, int eventId, ProductFilter filter)
    {
        if (filter == null)
        {
            throw new ArgumentNullException(nameof(filter));
        }

        if (!filter.IncludeArchived)
        {
            query = query.Where(p => !p.Archived);
        }

        if (filter.PublishedOnly)
        {
            query = query.Where(p => p.Published);
        }

        if (filter.MandatoryOnly)
        {
            query = query.Where(p => p.MinimumQuantity > 0);
        }

        switch (filter.Visibility)
        {
            case ProductVisibility.Event:
                query = query.Where(p => p.EventInfoId == eventId);
                break;

            case ProductVisibility.Collection:
                query = query.Where(p => p.EventInfoId == eventId ||
                                         (p.Visibility == ProductVisibility.Collection &&
                                          p.EventInfo.Collections
                                              .Any(c => c.Events
                                                  .Any(e => e.EventInfoId == eventId))));
                break;
        }

        return query;
    }

    public static IQueryable<Product> UseOptions(this IQueryable<Product> query,
        ProductRetrievalOptions options)
    {
        if (options == null)
        {
            throw new ArgumentNullException(nameof(options));
        }

        if (!options.ForUpdate)
        {
            query = query.AsNoTracking();
        }

        if (options.LoadEvent)
        {
            query = query.Include(e => e.EventInfo);
        }

        if (options.LoadVariants)
        {
            query = query.Include(e => e.ProductVariants);
        }

        return query;
    }

    public static IQueryable<Product> UseOrder(this IQueryable<Product> query, ProductRetrievalOrder order,
        bool descending)
    {
        switch (order)
        {
            case ProductRetrievalOrder.Name:
                return descending
                    ? query.OrderByDescending(e => e.Name)
                    : query.OrderBy(e => e.Name);

            default:
                throw new InvalidOperationException($"Unsupported product order: {order}");
        }
    }
}
