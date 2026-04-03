#nullable enable

using System;
using System.Linq;
using System.Security.Claims;

namespace Eventuras.Services.Tests;

public static class HttpContextAccessorUtils
{
    public static ClaimsPrincipal GetUser(Guid userId, params string[] roles)
    {
        var identity = new ClaimsIdentity("Eventuras.Database");
        identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, userId.ToString()));
        identity.AddClaims(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var principal = new ClaimsPrincipal();
        principal.AddIdentity(identity);

        return principal;
    }
}
