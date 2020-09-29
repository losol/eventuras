using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.Organizations
{
    internal class OrganizationManagementService : IOrganizationManagementService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<OrganizationManagementService> _logger;

        public OrganizationManagementService(
            ApplicationDbContext context,
            IHttpContextAccessor httpContextAccessor,
            ILogger<OrganizationManagementService> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
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

            try
            {
                await _context.Organizations.AddAsync(organization);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException e) when (e.IsUniqueKeyViolation())
            {
                _logger.LogWarning(e, e.Message);
                _context.Remove(organization);
                throw new DuplicateOrganizationHostnameException();
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

            try
            {
                _context.Organizations.Update(organization);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException e) when (e.IsUniqueKeyViolation())
            {
                _logger.LogWarning(e, e.Message);
                _context.Entry(organization).State = EntityState.Detached;
                throw new DuplicateOrganizationHostnameException();
            }
        }

        public async Task UpdateOrganizationHostnames(int id, string[] hostnames)
        {
            if (hostnames == null)
            {
                throw new ArgumentNullException(nameof(hostnames));
            }

            var organization = await _context.Organizations
                .Include(o => o.Hostnames)
                .SingleOrDefaultAsync(o => o.OrganizationId == id);

            if (organization == null)
            {
                throw new InvalidOperationException($"Organization {id} not found");
            }

            if (!organization.Active)
            {
                throw new InvalidOperationException($"Organization {id} is deleted");
            }

            var normalizedHostnames = hostnames
                .Select(h => h?.Trim().ToLower())
                .Where(h => !string.IsNullOrWhiteSpace(h))
                .ToArray();

            foreach (var hostname in normalizedHostnames)
            {
                if (await _context.OrganizationHostnames
                    .AnyAsync(h => h.OrganizationId != id &&
                                  h.Active &&
                                  h.Hostname == hostname))
                {
                    throw new DuplicateOrganizationHostnameException(hostname);
                }
            }

            var oldHostnames = organization.Hostnames
                .ToDictionary(h => h.Hostname);

            foreach (var hostname in normalizedHostnames)
            {
                if (oldHostnames.ContainsKey(hostname))
                {
                    oldHostnames[hostname].Active = true;
                    oldHostnames.Remove(hostname); // still actual, don't trash it
                }
                else
                {
                    await _context.OrganizationHostnames.AddAsync(new OrganizationHostname
                    {
                        OrganizationId = id,
                        Hostname = hostname,
                        Active = true
                    });
                }
            }

            _context.OrganizationHostnames.RemoveRange(oldHostnames.Values);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteOrganizationAsync(int id)
        {
            var organization = await _context.Organizations
                .Include(o => o.Hostnames)
                .SingleOrDefaultAsync(o => o.OrganizationId == id);

            organization.Active = false;
            organization.Hostnames.ForEach(h => h.Active = false);

            await _context.SaveChangesAsync();
        }
    }
}
