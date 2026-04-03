#nullable enable

using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Eventuras.Infrastructure;
using Eventuras.Services.Auth;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Eventuras.Services.Users;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.WebApi;

/// <summary>
///     Transforms incoming claims to enrich the principal with the database user ID
///     and organization-specific roles.
/// </summary>
public class DbUserClaimTransformation : IClaimsTransformation
{
    private const string EventurasDbAuthType = "Eventuras.Database";

    private readonly IUserRetrievalService _userRetrievalService;
    private readonly ApplicationDbContext _context;
    private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;

    public DbUserClaimTransformation(
        IUserRetrievalService userRetrievalService,
        ApplicationDbContext context,
        ICurrentOrganizationAccessorService currentOrganizationAccessorService)
    {
        _userRetrievalService = userRetrievalService;
        _context = context;
        _currentOrganizationAccessorService = currentOrganizationAccessorService;
    }

    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        var userEmail = principal.GetEmail();
        if (userEmail == null)
        {
            return principal;
        }

        if (principal.Identities.Any(i => i.AuthenticationType == EventurasDbAuthType))
        {
            return principal;
        }

        try
        {
            var dbUser = await _userRetrievalService.GetUserByEmailAsync(userEmail);

            var identity = new ClaimsIdentity(EventurasDbAuthType);
            identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, dbUser.Id.ToString()));

            var organization = await _currentOrganizationAccessorService.GetCurrentOrganizationAsync();
            if (organization != null)
            {
                var member = await _context.OrganizationMembers
                    .AsNoTracking()
                    .Include(m => m.Roles)
                    .SingleOrDefaultAsync(m =>
                        m.OrganizationId == organization.OrganizationId &&
                        m.UserId == dbUser.Id);

                if (member != null)
                {
                    foreach (var role in member.Roles)
                    {
                        identity.AddClaim(new Claim(ClaimTypes.Role, role.Role));
                    }
                }
            }

            principal.AddIdentity(identity);
        }
        catch (NotFoundException)
        {
            // User not yet in DB — principal stays as-is
        }

        return principal;
    }
}
