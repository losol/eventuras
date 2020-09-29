using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Eventuras.Services.Organizations
{
    internal class OrganizationRetrievalService : IOrganizationRetrievalService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public OrganizationRetrievalService(
            ApplicationDbContext context,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        }

        public async Task<List<Organization>> ListOrganizationsAsync(
            OrganizationFilter filter,
            OrganizationRetrievalOptions options)
        {
            var user = _httpContextAccessor.HttpContext.User;
            if (!user.Identity.IsAuthenticated)
            {
                return new List<Organization>();
            }

            var query = _context.Organizations.AsNoTracking();
            if (!user.IsInRole(Roles.SuperAdmin)) // Super admin can see all orgs.
            {
                query = query.HasOrganizationMember(user);
            }

            return await query
                .UseFilter(filter ?? new OrganizationFilter())
                .UseOptions(options ?? new OrganizationRetrievalOptions())
                .ToListAsync();
        }

        public async Task<Organization> GetOrganizationByIdAsync(int id, OrganizationRetrievalOptions options)
        {
            options ??= new OrganizationRetrievalOptions();

            var user = _httpContextAccessor.HttpContext.User;
            if (!user.Identity.IsAuthenticated)
            {
                throw new AccessViolationException("Not authenticated.");
            }

            var query = _context.Organizations
                .AsNoTracking()
                .Where(m => m.OrganizationId == id);

            if (!user.IsInRole(Roles.SuperAdmin)) // Super admin can see all orgs.
            {
                query = query.HasOrganizationMember(user);
            }

            return await query
                .UseOptions(options)
                .SingleOrDefaultAsync();
        }
    }
}
