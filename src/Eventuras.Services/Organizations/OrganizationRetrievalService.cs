using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Organizations
{
    internal class OrganizationRetrievalService : IOrganizationRetrievalService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IOrganizationAccessControlService _organizationAccessControlService;

        public OrganizationRetrievalService(
            ApplicationDbContext context,
            IHttpContextAccessor httpContextAccessor,
            IOrganizationAccessControlService organizationAccessControlService)
        {
            _context = context ?? throw
                new ArgumentNullException(nameof(context));

            _httpContextAccessor = httpContextAccessor ?? throw
                new ArgumentNullException(nameof(httpContextAccessor));

            _organizationAccessControlService = organizationAccessControlService ?? throw
                new ArgumentNullException(nameof(organizationAccessControlService));
        }

        public async Task<List<Organization>> ListOrganizationsAsync(
            OrganizationFilter filter,
            OrganizationRetrievalOptions options,
            CancellationToken cancellationToken)
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
                .ToListAsync(cancellationToken);
        }

        public async Task<Organization> GetOrganizationByIdAsync(
            int id,
            OrganizationRetrievalOptions options,
            CancellationToken cancellationToken)
        {
            options ??= new OrganizationRetrievalOptions();

            var query = _context.Organizations
                .AsNoTracking()
                .Where(m => m.OrganizationId == id);

            var org = await query
                .UseOptions(options)
                .FirstOrDefaultAsync(cancellationToken);

            if (org == null)
            {
                throw new NotFoundException($"Organization {id} not found");
            }

            await _organizationAccessControlService
                .CheckOrganizationReadAccessAsync(id);

            return org;
        }
    }
}
