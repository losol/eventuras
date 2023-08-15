using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

namespace Eventuras.Services.Auth0;

internal static class ClaimsPrincipalExtensions
{
    public static string GetRequiredClaim(this ClaimsPrincipal principal, string claimType)
    {
        var value = principal.GetOptionalClaim(claimType);
        if (string.IsNullOrEmpty(value)) throw new ArgumentException($"{ClaimTypes.Name} claim is required");

        return value;
    }

    public static string GetOptionalClaim(this ClaimsPrincipal principal, string claimType)
    {
        return principal.FindFirst(c => c.Type == claimType)?.Value;
    }

    public static string GetName(this ClaimsPrincipal principal)
    {
        var name = principal.GetOptionalClaim(ClaimTypes.Name);
        if (!string.IsNullOrEmpty(name)) return name;

        name = principal.GetOptionalClaim("name");
        if (!string.IsNullOrEmpty(name)) return name;

        var givenName = principal.GetOptionalClaim(ClaimTypes.GivenName);
        var surname = principal.GetOptionalClaim(ClaimTypes.Surname);
        if (!string.IsNullOrEmpty(givenName) && !string.IsNullOrEmpty(surname)) return $"{givenName} {surname}";

        throw new ArgumentException("User name not found in claims");
    }

    public static IEnumerable<Claim> GetAllClaimsExcept(this ClaimsPrincipal principal, params string[] claimTypes)
    {
        return principal.Claims.Where(c => !claimTypes.Contains(c.Type));
    }
}