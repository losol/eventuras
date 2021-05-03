using Eventuras.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace Eventuras.Services.Users
{
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
                query = query.Where(u => u.Name.ToLower().Contains(q) ||
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
                query = query.Include(o => o.OrganizationMembership);
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
                case UserListOrder.Name:
                    query = descending
                        ? query.OrderByDescending(a => a.Name)
                        : query.OrderBy(a => a.Name);
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
}
