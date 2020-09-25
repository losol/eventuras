using System;
using Eventuras.Domain;
using Eventuras.Services.Auth;
using System.Linq;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Organizations
{
    internal static class OrganizationQueryableExtensions
    {
        public static IQueryable<Organization> UseFilter(this IQueryable<Organization> query, OrganizationFilter filter)
        {
            if (filter == null)
                throw new ArgumentNullException(nameof(filter));

            if (filter.InactiveOnly)
            {
                query = query.Where(o => !o.Active);
            }
            else if (!filter.IncludeInactive)
            {
                query = query.Where(o => o.Active);
            }

            if (filter.ParentOnly)
            {
                query = query.Where(o => o.ParentOrganizationId == null);
            }

            return query;
        }

        public static IQueryable<Organization> UseOptions(this IQueryable<Organization> query, OrganizationRetrievalOptions options)
        {
            if (options == null)
                throw new ArgumentNullException(nameof(options));

            if (options.LoadChildOrganizations)
            {
                query = query.Include(o => o.ChildOrganizations);
            }

            if (options.LoadParentOrganization)
            {
                query = query.Include(o => o.ParentOrganization);
            }

            if (options.LoadMembers)
            {
                query = query.Include(o => o.Members);
            }

            return query;
        }

        public static IQueryable<Organization> HasOrganizationMember(this IQueryable<Organization> query, ClaimsPrincipal user)
        {
            return query.Where(o => o.Members.Any(m => m.UserId == user.GetUserId()) ||
                                    o.ParentOrganization.Members.Any(m => m.UserId == user.GetUserId()));
        }
    }
}
