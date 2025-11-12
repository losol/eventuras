#nullable enable

using System.Linq;
using System.Security.Claims;

namespace Eventuras.Services.Tests;

public static class HttpContextAccessorUtils
{
    public static ClaimsPrincipal GetUser(string userId, params string[] roles)
    {
        var identity = new ClaimsIdentity("Identity.Application");
        identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, userId));
        identity.AddClaims(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var principal = new ClaimsPrincipal();
        principal.AddIdentity(identity);

        return principal;
    }
}
