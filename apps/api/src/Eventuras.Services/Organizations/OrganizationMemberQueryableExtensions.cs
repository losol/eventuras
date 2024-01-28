using Eventuras.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace Eventuras.Services.Organizations
{
    internal static class OrganizationMemberQueryableExtensions
    {
        public static IQueryable<OrganizationMember> UseOptions(
            this IQueryable<OrganizationMember> query,
            OrganizationMemberRetrievalOptions options)
        {
            if (options == null)
            {
                throw new ArgumentNullException(nameof(options));
            }

            if (options.LoadRoles)
            {
                query = query.Include(m => m.Roles);
            }

            return query;
        }
    }
}
