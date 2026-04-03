#nullable enable

using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

namespace Eventuras.Services.Auth;

public static class ClaimsPrincipalExtensions
{
    public static Guid? GetUserId(this ClaimsPrincipal user)
    {
        var dbIdentity = user.Identities.FirstOrDefault(i => i.AuthenticationType == "Eventuras.Database");
        var value = dbIdentity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return value != null && Guid.TryParse(value, out var id) ? id : null;
    }

    public static string? GetEmail(this ClaimsPrincipal user) => user.FindFirstValue(ClaimTypes.Email);

    public static string? GetName(this ClaimsPrincipal user) => user.FindFirstValue(ClaimTypes.Name);

    public static string? GetMobilePhone(this ClaimsPrincipal user) => user.FindFirstValue(ClaimTypes.MobilePhone);

    public static IEnumerable<string> GetRoles(this ClaimsPrincipal user) =>
        user.FindAll(ClaimTypes.Role).Select(c => c.Value);

    public static bool IsAdmin(this ClaimsPrincipal user) =>
        new[] { Roles.Admin, Roles.SystemAdmin }.Any(user.IsInRole);

    public static bool IsSystemAdmin(this ClaimsPrincipal user) => user.IsInRole(Roles.SystemAdmin);

    public static bool IsAnonymous(this ClaimsPrincipal user) => user.Identity?.IsAuthenticated != true;
}
