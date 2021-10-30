using System.Linq;
using Eventuras.Domain;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Notifications
{
    internal static class NotificationRecipientsQueryableExtensions
    {
        public static IQueryable<NotificationRecipient> AddFilter(
            this IQueryable<NotificationRecipient> query,
            NotificationRecipientFilter filter)
        {
            if (filter.NotificationIds?.Any() == true)
            {
                query = query.Where(r => filter.NotificationIds
                    .Contains(r.NotificationId));
            }

            if (filter.SentOnly)
            {
                query = query.Where(r => r.Sent.HasValue);
            }

            if (filter.ErrorsOnly)
            {
                query = query.Where(r => r.Errors != null);
            }

            var filterQuery = filter.Query?.ToLower();
            if (!string.IsNullOrEmpty(filterQuery))
            {
                query = query.Where(r => r.RecipientName.ToLower().Contains(filterQuery) ||
                                         r.RecipientIdentifier.ToLower().Contains(filterQuery));
            }

            return query;
        }

        public static IQueryable<NotificationRecipient> WithOptions(
            this IQueryable<NotificationRecipient> query,
            NotificationRecipientRetrievalOptions options)
        {
            if (!options.ForUpdate)
            {
                query = query.AsNoTracking();
            }

            if (options.LoadRegistration)
            {
                query = query.Include(r => r.Registration);
            }

            if (options.LoadUser)
            {
                query = query.Include(r => r.RecipientUser);
            }

            return query;
        }

        public static IQueryable<NotificationRecipient> AddOrder(
            this IQueryable<NotificationRecipient> query,
            NotificationRecipientListOrder order,
            bool descending = false)
        {
            switch (order)
            {
                case NotificationRecipientListOrder.Created:
                    query = descending
                        ? query.OrderByDescending(r => r.Created)
                        : query.OrderBy(r => r.Created);
                    break;

                case NotificationRecipientListOrder.Sent:
                    query = descending
                        ? query.OrderByDescending(r => r.Sent)
                        : query.OrderBy(r => r.Sent);
                    break;

                case NotificationRecipientListOrder.Name:
                    query = descending
                        ? query.OrderByDescending(r => r.Sent)
                        : query.OrderBy(r => r.Sent);
                    break;
            }

            return query;
        }
    }
}
