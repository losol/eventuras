using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Eventuras.Services.Auth;

internal class ApplicationClaimsIdentityFactory : UserClaimsPrincipalFactory<ApplicationUser, IdentityRole>
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;

    public ApplicationClaimsIdentityFactory(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IOptions<IdentityOptions> optionsAccessor,
        ApplicationDbContext context,
        ICurrentOrganizationAccessorService currentOrganizationAccessorService) : base(userManager, roleManager,
        optionsAccessor)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _currentOrganizationAccessorService = currentOrganizationAccessorService ?? throw
            new ArgumentNullException(nameof(currentOrganizationAccessorService));
    }

    protected override async Task<ClaimsIdentity> GenerateClaimsAsync(ApplicationUser user)
    {
        var identity = await base.GenerateClaimsAsync(user);

        var defaultRoleClaims = identity.Claims
            .Where(c => c.Type == identity.RoleClaimType)
            .ToArray();

        if (defaultRoleClaims.Any(c => c.Value == Roles.SuperAdmin))
        {
            return identity;
        }

        // For all users except super admin replace
        // default roles assigned by AspNetIdentity with
        // org-specific roles.

        foreach (var roleClaim in defaultRoleClaims)
        {
            identity.RemoveClaim(roleClaim);
        }

        var organization = await _currentOrganizationAccessorService.GetCurrentOrganizationAsync();
        if (organization == null)
        {
            return identity;
        }

        var member = await _context.OrganizationMembers
            .AsNoTracking()
            .Include(m => m.Roles)
            .SingleOrDefaultAsync(m =>
                m.OrganizationId == organization.OrganizationId &&
                m.UserId == user.Id);

        if (member == null)
        {
            return identity;
        }

        var orgSpecificRoles = member.Roles
            .Select(r => r.Role)
            .ToHashSet() ?? new HashSet<string>();

        foreach (var role in orgSpecificRoles)
        {
            identity.AddClaim(new Claim(identity.RoleClaimType, role));
        }

        return identity;
    }
}
