using Eventuras.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace Eventuras.Services.Users
{
    internal static class UserQueryableExtensions
    {
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
    }
}
