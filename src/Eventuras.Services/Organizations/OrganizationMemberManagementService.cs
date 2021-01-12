using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Auth;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.Organizations
{
    internal class OrganizationMemberManagementService : IOrganizationMemberManagementService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;
        private readonly ILogger<OrganizationMemberManagementService> _logger;

        public OrganizationMemberManagementService(
            ApplicationDbContext context,
            IHttpContextAccessor httpContextAccessor,
            ICurrentOrganizationAccessorService currentOrganizationAccessorService,
            ILogger<OrganizationMemberManagementService> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
            _currentOrganizationAccessorService = currentOrganizationAccessorService ?? throw new ArgumentNullException(nameof(currentOrganizationAccessorService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<OrganizationMember> FindOrganizationMemberAsync(
            ApplicationUser user,
            Organization organization = null,
            OrganizationMemberRetrievalOptions options = null)
        {
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            organization ??= await _currentOrganizationAccessorService
                .GetCurrentOrganizationAsync();

            if (organization == null)
            {
                return null;
            }

            return await FindExistingMemberAsync(organization, user, options);
        }

        public async Task<OrganizationMember> AddToOrganizationAsync(
            ApplicationUser user,
            Organization organization = null,
            OrganizationMemberRetrievalOptions options = null)
        {
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            organization ??= await _currentOrganizationAccessorService
                .RequireCurrentOrganizationAsync();

            await CheckOrganizationAdminAccessAsync(organization);

            var member = await FindExistingMemberAsync(organization, user,
                options ?? new OrganizationMemberRetrievalOptions());

            if (member == null)
            {
                try
                {
                    member = new OrganizationMember
                    {
                        OrganizationId = organization.OrganizationId,
                        UserId = user.Id
                    };
                    await _context.OrganizationMembers.AddAsync(member);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateException e) when (e.IsUniqueKeyViolation())
                {
                    _logger.LogWarning(e, e.Message);
                    if (member != null)
                    {
                        _context.OrganizationMembers.Remove(member);
                    }
                    return await FindExistingMemberAsync(organization, user, options);
                }
            }

            return member;
        }

        public async Task RemoveFromOrganizationAsync(
            ApplicationUser user,
            Organization organization)
        {
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            organization ??= await _currentOrganizationAccessorService
                .RequireCurrentOrganizationAsync();

            await CheckOrganizationAdminAccessAsync(organization);

            var member = await FindExistingMemberAsync(organization, user);
            if (member != null)
            {
                _context.OrganizationMembers.Remove(member);
                await _context.SaveChangesAsync();
            }
        }

        private async Task<OrganizationMember> FindExistingMemberAsync(
            Organization organization,
            ApplicationUser user,
            OrganizationMemberRetrievalOptions options = null)
        {
            return await _context.OrganizationMembers
                .AsNoTracking()
                .UseOptions(options ?? new OrganizationMemberRetrievalOptions())
                .FirstOrDefaultAsync(m => m.OrganizationId == organization.OrganizationId &&
                                          m.UserId == user.Id);
        }

        private async Task CheckOrganizationAdminAccessAsync(Organization organization)
        {
            var principal = _httpContextAccessor.HttpContext.User;

            var userId = principal.GetUserId();
            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new AccessViolationException("Not authenticated.");
            }

            if (!principal.IsInRole(Roles.Admin) &&
                !principal.IsInRole(Roles.SuperAdmin))
            {
                throw new AccessViolationException($"Should have at least {Roles.Admin} role to manage org membership.");
            }

            if (!principal.IsInRole(Roles.SuperAdmin) &&
                !await _context.OrganizationMembers
                    .AnyAsync(m => m.UserId == userId &&
                                   m.OrganizationId == organization.OrganizationId))
            {
                throw new AccessViolationException($"Cannot access organization {organization.OrganizationId}.");
            }
        }
    }
}
