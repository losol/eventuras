using System.Linq;
using Eventuras.Domain;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Orders
{
    public static class OrdersQueryableExtensions
    {
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
                query = query.Include(o => o.OrderLines);
            }

            return query;
        }
    }
}
