using System;
using System.Linq;
using Eventuras.Domain;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Users;

internal static class UserQueryableExtensions
{
    public static IQueryable<ApplicationUser> AddFilter(this IQueryable<ApplicationUser> query, UserFilter filter)
    {
        if (!filter.IncludeArchived)
        {
            query = query.Where(u => !u.Archived);
        }

        if (!string.IsNullOrWhiteSpace(filter.Query))
        {
            var q = filter.Query.Trim().ToLower();
            query = query.Where(u => u.GivenName.ToLower().Contains(q) ||
                u.FamilyName.ToLower().Contains(q) ||
                u.Email.ToLower().Contains(q) ||
                u.PhoneNumber.ToLower().Contains(q));
        }

        return query;
    }

    public static IQueryable<ApplicationUser> UseOptions(this IQueryable<ApplicationUser> query, UserRetrievalOptions options)
    {
        if (options == null)
            throw new ArgumentNullException(nameof(options));

        if (options.IncludeOrgMembership)
        {
            query = query.Include(o => o.OrganizationMembership)
                .ThenInclude(m => m.Roles);
        }

        return query;
    }

    public static IQueryable<ApplicationUser> HavingNoOrganizationOnly(this IQueryable<ApplicationUser> query)
    {
        return query.Where(u => !u.OrganizationMembership.Any());
    }

    public static IQueryable<ApplicationUser> HavingOrganization(this IQueryable<ApplicationUser> query, Organization organization)
    {
        if (organization == null)
            throw new ArgumentNullException(nameof(organization));

        return query.Where(u => u.OrganizationMembership
            .Any(m => m.OrganizationId == organization.OrganizationId));
    }

    public static IQueryable<ApplicationUser> AddOrder(
        this IQueryable<ApplicationUser> query,
        UserListOrder order,
        bool descending = false)
    {
        switch (order)
        {
            case UserListOrder.GivenName:
                query = descending
                    ? query.OrderByDescending(a => a.GivenName)
                    : query.OrderBy(a => a.GivenName);
                break;

            case UserListOrder.FamilyName:
                query = descending
                    ? query.OrderByDescending(a => a.FamilyName)
                    : query.OrderBy(a => a.FamilyName);
                break;

            case UserListOrder.Email:
                query = descending
                    ? query.OrderByDescending(a => a.Email)
                    : query.OrderBy(a => a.Email);
                break;

            case UserListOrder.Phone:
                query = descending
                    ? query.OrderByDescending(a => a.PhoneNumber)
                    : query.OrderBy(a => a.PhoneNumber);
                break;
        }

        return query;
    }
}
