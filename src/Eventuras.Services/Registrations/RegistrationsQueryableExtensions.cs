using Eventuras.Domain;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace Eventuras.Services.Registrations
{
    internal static class RegistrationsQueryableExtensions
    {
        public static IQueryable<Registration> AddFilter(
            this IQueryable<Registration> query,
            RegistrationFilter filter)
        {
            if (filter == null)
            {
                return query;
            }

            if (filter.VerifiedOnly)
            {
                query = query.Where(r => r.Verified);
            }

            if (filter.ActiveUsersOnly)
            {
                query = query.Where(r => !r.User.Archived);
            }

            if (filter.HavingEmailConfirmedOnly)
            {
                query = query.Where(r => r.User.EmailConfirmed);
            }

            if (filter.EventInfoId.HasValue)
            {
                query = query.Where(r => r.EventInfoId == filter.EventInfoId);
            }

            if (!string.IsNullOrEmpty(filter.UserId))
            {
                query = query.Where(r => r.UserId == filter.UserId);
            }

            if (filter.HavingStatuses?.Any() == true)
            {
                query = query.Where(r => filter.HavingStatuses.Contains(r.Status));
            }

            if (filter.HavingTypes?.Any() == true)
            {
                query = query.Where(r => filter.HavingTypes.Contains(r.Type));
            }

            return query;
        }

        public static IQueryable<Registration> WithOptions(
            this IQueryable<Registration> query,
            RegistrationRetrievalOptions options)
        {
            if (options == null)
            {
                return query;
            }

            if (options.IncludeUser)
            {
                query = query.Include(r => r.User);
            }

            if (options.IncludeEventInfo)
            {
                query = query.Include(r => r.EventInfo);
            }

            if (options.IncludeOrders)
            {
                query = query.Include(r => r.Orders)
                    .ThenInclude(o => o.OrderLines);
            }

            if (options.IncludeProducts)
            {
                query = query.Include(r => r.Orders)
                    .ThenInclude(o => o.OrderLines)
                    .ThenInclude(l => l.Product);

                query = query.Include(r => r.Orders)
                    .ThenInclude(o => o.OrderLines)
                    .ThenInclude(l => l.ProductVariant);
            }

            return query;
        }

        public static IQueryable<Registration> AddOrder(
            this IQueryable<Registration> query,
            RegistrationListOrder order,
            bool descending = false)
        {
            switch (order)
            {
                case RegistrationListOrder.RegistrationTime:
                    query = descending
                        ? query.OrderByDescending(r => r.RegistrationTime)
                        : query.OrderBy(r => r.RegistrationTime);
                    break;
            }

            return query;
        }
    }
}
