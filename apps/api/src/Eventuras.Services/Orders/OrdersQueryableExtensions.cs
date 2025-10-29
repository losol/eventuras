using System;
using System.Linq;
using Eventuras.Domain;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Orders;

public static class OrdersQueryableExtensions
{
    public static IQueryable<Order> HavingOrganization(this IQueryable<Order> query, Organization organization)
    {
        if (organization == null)
            throw new ArgumentNullException(nameof(organization));

        return query.Where(o => o.Registration.EventInfo.OrganizationId == organization.OrganizationId);
    }

    public static IQueryable<Order> WithOptions(
        this IQueryable<Order> query,
        OrderRetrievalOptions options)
    {
        if (options.IncludeRegistration)
        {
            query = query.Include(o => o.Registration);
        }

        if (options.IncludeUser)
        {
            query = query
                .Include(o => o.User)
                .Include(o => o.Registration)
                .ThenInclude(r => r.User);
        }

        if (options.IncludeEvent)
        {
            query = query.Include(o => o.Registration)
                .ThenInclude(r => r.EventInfo);
        }

        if (options.IncludeOrderLines)
        {
            query = query.Include(o => o.OrderLines)
                .ThenInclude(l => l.Product);

            query = query.Include(o => o.OrderLines)
                .ThenInclude(l => l.ProductVariant);
        }

        return query;
    }

    public static IQueryable<Order> WithFilter(
        this IQueryable<Order> query,
        OrderListFilter filter)
    {
        if (!string.IsNullOrEmpty(filter.UserId))
        {
            query = query.Where(o => o.UserId == filter.UserId);
        }

        if (filter.RegistrationId.HasValue)
        {
            query = query.Where(o => o.RegistrationId == filter.RegistrationId);
        }

        if (filter.EventId.HasValue)
        {
            query = query.Where(o => o.Registration.EventInfoId == filter.EventId);
        }

        if (filter.Status.HasValue)
        {
            query = query.Where(o => o.Status == filter.Status);
        }

        if (filter.OrganizationId.HasValue)
        {
            query = query.Where(o => o.Registration.EventInfo.OrganizationId == filter.OrganizationId);
        }

        return query;
    }

    public static IQueryable<Order> WithOrder(
        this IQueryable<Order> query,
        OrderListOrder order,
        bool descending = false)
    {
        switch (order)
        {
            case OrderListOrder.Time:
                query = descending
                    ? query.OrderByDescending(o => o.OrderTime)
                    : query.OrderBy(o => o.OrderTime);
                break;
        }

        return query;
    }
}
