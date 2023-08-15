using System.Linq;
using Eventuras.Domain;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Notifications;

internal static class NotificationsQueryableExtensions
{
    public static IQueryable<Notification> AddFilter(this IQueryable<Notification> query, NotificationFilter filter)
    {
        if (filter.EventId.HasValue) query = query.Where(n => n.EventInfoId == filter.EventId);

        if (filter.ProductId.HasValue) query = query.Where(n => n.ProductId == filter.ProductId);

        if (filter.Statuses?.Any() == true) query = query.Where(n => filter.Statuses.Contains(n.Status));

        if (filter.Types?.Any() == true) query = query.Where(n => filter.Types.Contains(n.Type));

        if (filter.SenderUserId != null) query = query.Where(n => n.CreatedByUserId == filter.SenderUserId);

        if (filter.RecipientUserId != null) query = query.Where(n => n.Recipients.Any(r => r.RecipientUserId == filter.RecipientUserId));

        return query;
    }

    public static IQueryable<Notification> WithOptions(this IQueryable<Notification> query, NotificationRetrievalOptions options)
    {
        if (!options.ForUpdate) query = query.AsNoTracking();

        if (options.LoadEvent) query = query.Include(n => n.EventInfo);

        if (options.LoadProduct) query = query.Include(n => n.Product);

        if (options.LoadOrganization) query = query.Include(n => n.Organization);

        if (options.LoadRecipients) query = query.Include(n => n.Recipients).ThenInclude(r => r.RecipientUser);

        if (options.LoadSender) query = query.Include(n => n.CreatedByUser);

        if (options.LoadStatistics) query = query.Include(n => n.Statistics);

        return query;
    }

    public static IQueryable<Notification> AddOrder(this IQueryable<Notification> query, NotificationListOrder order, bool descending = false)
    {
        switch (order)
        {
            case NotificationListOrder.Created:
                query = descending ? query.OrderByDescending(n => n.Created) : query.OrderBy(n => n.Created);
                break;

            case NotificationListOrder.StatusUpdated:
                query = descending ? query.OrderByDescending(n => n.StatusUpdated) : query.OrderBy(n => n.StatusUpdated);
                break;
        }

        return query;
    }
}