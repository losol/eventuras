#nullable enable

using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

namespace Eventuras.Services.Auth;

public static class ClaimsPrincipalExtensions
{
    private const string EmailClaimType = "email";
    private const string NameClaimType = "name";
    private const string PhoneNumberClaimType = "phone_number";

    public static Guid? GetUserId(this ClaimsPrincipal user)
    {
        var dbIdentity = user.Identities.FirstOrDefault(i => i.AuthenticationType == "Eventuras.Database");
        var value = dbIdentity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return value != null && Guid.TryParse(value, out var id) ? id : null;
    }

    public static string? GetEmail(this ClaimsPrincipal user) =>
        user.FindFirstValue(ClaimTypes.Email) ?? user.FindFirstValue(EmailClaimType);

    public static string? GetName(this ClaimsPrincipal user) =>
        user.FindFirstValue(ClaimTypes.Name) ?? user.FindFirstValue(NameClaimType);

    public static string? GetMobilePhone(this ClaimsPrincipal user) =>
        user.FindFirstValue(ClaimTypes.MobilePhone) ?? user.FindFirstValue(PhoneNumberClaimType);

    // Read roles per identity using that identity's RoleClaimType (same basis as
    // IsInRole): the JWT identity uses the configured Auth:RoleClaimType (e.g.
    // "roles" for Keycloak), the DB identity uses ClaimTypes.Role. A hardcoded
    // ClaimTypes.Role here would miss IdP roles when RoleClaimType is "roles".
    public static IEnumerable<string> GetRoles(this ClaimsPrincipal user) =>
        user.Identities
            .SelectMany(identity => identity.FindAll(identity.RoleClaimType))
            .Select(c => c.Value)
            .Distinct();

    public static bool IsAdmin(this ClaimsPrincipal user) =>
        new[] { Roles.Admin, Roles.SystemAdmin }.Any(user.IsInRole);

    public static bool IsSystemAdmin(this ClaimsPrincipal user) => user.IsInRole(Roles.SystemAdmin);

    public static bool IsAnonymous(this ClaimsPrincipal user) => user.Identity?.IsAuthenticated != true;
}
