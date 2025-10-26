using System.Linq;
using Eventuras.Domain;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Registrations;

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

        if (filter.ActiveUsersOnly)
        {
            query = query.Where(r => !r.User.Archived);
        }

        if (filter.HavingEmailConfirmedOnly)
        {
            query = query.Where(r => r.User.EmailConfirmed);
        }

        if (filter.HavingCertificateOnly)
        {
            query = query.Where(r => r.CertificateId.HasValue);
        }

        if (filter.HavingNoCertificateOnly)
        {
            query = query.Where(r => !r.CertificateId.HasValue);
        }

        if (filter.EventInfoId.HasValue)
        {
            query = query.Where(r => r.EventInfoId == filter.EventInfoId);
        }

        if (filter.CertificateId.HasValue)
        {
            query = query.Where(r => r.CertificateId == filter.CertificateId);
        }

        if (filter.ProductIds.Any())
        {
            query = query.Where(r => r.Orders.Any(o => o.OrderLines
                .Any(l => l.ProductId.HasValue &&
                          filter.ProductIds.Contains(l.ProductId.Value))));
        }

        if (!string.IsNullOrEmpty(filter.UserId))
        {
            query = query.Where(r => r.UserId == filter.UserId);
        }

        if (filter.HavingStatuses.Any())
        {
            query = query.Where(r => filter.HavingStatuses.Contains(r.Status));
        }

        if (filter.HavingTypes.Any())
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

        if (!options.ForUpdate)
        {
            query = query.AsNoTracking();
        }

        if (options.LoadUser)
        {
            query = query.Include(r => r.User);
        }

        if (options.LoadEventInfo)
        {
            query = query.Include(r => r.EventInfo);
        }

        if (options.LoadEventOrganization)
        {
            query = query.Include(r => r.EventInfo)
                .ThenInclude(e => e.Organization);
        }

        if (options.LoadEventOrganizer)
        {
            query = query.Include(r => r.EventInfo)
                .ThenInclude(e => e.OrganizerUser);
        }

        if (options.LoadOrders)
        {
            query = query.Include(r => r.Orders)
                .ThenInclude(o => o.OrderLines);
        }

        if (options.LoadProducts)
        {
            query = query.Include(r => r.Orders)
                .ThenInclude(o => o.OrderLines)
                .ThenInclude(l => l.Product);

            query = query.Include(r => r.Orders)
                .ThenInclude(o => o.OrderLines)
                .ThenInclude(l => l.ProductVariant);
        }

        if (options.LoadCertificate)
        {
            query = query.Include(r => r.Certificate)
                .ThenInclude(c => c.IssuingOrganization);

            query = query.Include(r => r.Certificate)
                .ThenInclude(c => c.IssuingUser);
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
