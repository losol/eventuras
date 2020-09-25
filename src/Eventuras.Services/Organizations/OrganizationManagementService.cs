using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace Eventuras.Services.Organizations
{
    internal class OrganizationManagementService : IOrganizationManagementService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public OrganizationManagementService(
            ApplicationDbContext context,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        }

        public async Task CreateNewOrganizationAsync(Organization organization)
        {
            if (organization == null)
            {
                throw new ArgumentNullException(nameof(organization));
            }

            if (!_httpContextAccessor.HttpContext.User.IsInRole(Roles.SuperAdmin))
            {
                throw new AccessViolationException($"Only {Roles.SuperAdmin} users can create new org.");
            }

            if (!string.IsNullOrWhiteSpace(organization.EventurasHostname) && organization.Active &&
                await _context.Organizations.AnyAsync(o =>
                    o.Active &&
                    o.EventurasHostname == organization.EventurasHostname))
            {
                throw new DuplicateOrganizationHostnameException("Duplicate org hostname");
            }

            try
            {
                await _context.Organizations.AddAsync(organization);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException e) when (e.IsUniqueKeyViolation())
            {
                _context.Remove(organization);
                throw new DuplicateOrganizationHostnameException("Duplicate org hostname", e);
            }
        }

        public async Task UpdateOrganizationAsync(Organization organization)
        {
            if (organization == null)
            {
                throw new ArgumentNullException(nameof(organization));
            }

            if (!_httpContextAccessor.HttpContext.User.IsInRole(Roles.SuperAdmin))
            {
                throw new AccessViolationException($"Only {Roles.SuperAdmin} users can update org.");
            }

            if (!string.IsNullOrWhiteSpace(organization.EventurasHostname) && organization.Active &&
                await _context.Organizations.AnyAsync(o =>
                    o.Active &&
                    o.EventurasHostname == organization.EventurasHostname &&
                    o.OrganizationId != organization.OrganizationId))
            {
                throw new DuplicateOrganizationHostnameException("Duplicate org hostname");
            }

            try
            {
                _context.Organizations.Update(organization);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException e) when (e.IsUniqueKeyViolation())
            {
                _context.Entry(organization).State = EntityState.Detached;
                throw new DuplicateOrganizationHostnameException("Duplicate org hostname", e);
            }
        }
    }
}
