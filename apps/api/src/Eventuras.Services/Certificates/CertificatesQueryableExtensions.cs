using System.Linq;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Certificates;

internal static class CertificatesQueryableExtensions
{
    public static IQueryable<Certificate> AddFilter(
        this IQueryable<Certificate> query,
        CertificateFilter filter,
        ApplicationDbContext context)
    {
        if (filter.EventId.HasValue)
        {
            query = from cert in query
                    join reg in context.Registrations
                        on cert equals reg.Certificate
                    join evt in context.EventInfos
                        on reg.EventInfo equals evt
                    where evt.EventInfoId == filter.EventId
                    select cert;
        }

        if (filter.RegistrationId.HasValue)
        {
            query = from cert in query
                    join reg in context.Registrations
                        on cert equals reg.Certificate
                    where reg.RegistrationId == filter.RegistrationId
                    select cert;
        }

        if (filter.Statuses?.Any() == true)
        {
            query = query.Where(c => filter.Statuses.Contains(c.Status));
        }

        if (filter.RecipientIds?.Any() == true)
        {
            query = query.Where(c => filter.RecipientIds.Contains(c.RecipientUserId));
        }

        return query;
    }

    public static IQueryable<Certificate> WithOptions(
        this IQueryable<Certificate> query,
        CertificateRetrievalOptions options)
    {
        if (!options.ForUpdate)
        {
            query = query.AsNoTracking();
        }

        if (options.LoadIssuingOrganization)
        {
            query = query.Include(c => c.IssuingOrganization);
        }

        if (options.LoadIssuingUser)
        {
            query = query.Include(c => c.IssuingUser);
        }

        if (options.LoadRecipientUser)
        {
            query = query.Include(c => c.RecipientUser);
        }

        return query;
    }

    public static IQueryable<Certificate> AddOrder(
        this IQueryable<Certificate> query,
        CertificateListOrder order,
        bool descending = false)
    {
        switch (order)
        {
            case CertificateListOrder.Title:
                query = descending
                    ? query.OrderByDescending(c => c.Title)
                    : query.OrderBy(c => c.Title);
                break;

            case CertificateListOrder.Issued:
                query = descending
                    ? query.OrderByDescending(c => c.IssuedDate)
                    : query.OrderBy(c => c.IssuedDate);
                break;
        }

        return query;
    }
}
