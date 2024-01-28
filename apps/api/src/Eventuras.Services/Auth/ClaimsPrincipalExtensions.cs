#nullable enable

using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;

namespace Eventuras.Services.Auth
{
    public static class ClaimsPrincipalExtensions
    {
        public static string? GetUserId(this ClaimsPrincipal user)
        {
            // For the local user the AuthenticationType is Identity.Application
            var applicationIdentity = user.Identities.FirstOrDefault(i => i.AuthenticationType == "Identity.Application");
            return applicationIdentity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        public static string? GetEmail(this ClaimsPrincipal user)
        {
            return user.FindFirstValue(ClaimTypes.Email);
        }

        public static string? GetName(this ClaimsPrincipal user)
        {
            return user.FindFirstValue(ClaimTypes.Name);
        }

        public static string? GetMobilePhone(this ClaimsPrincipal user)
        {
            return user.FindFirstValue(ClaimTypes.MobilePhone);
        }

        public static IEnumerable<string> GetRoles(this ClaimsPrincipal user)
        {
            return user.FindAll(ClaimTypes.Role).Select(c => c.Value);
        }

        public static bool IsAdmin(this ClaimsPrincipal user)
        {
            return new[] { Roles.Admin, Roles.SystemAdmin, Roles.SuperAdmin }.Any(user.IsInRole);
        }

        public static bool IsSuperAdmin(this ClaimsPrincipal user)
        {
            return user.IsInRole(Roles.SuperAdmin);
        }

        public static bool IsSystemAdmin(this ClaimsPrincipal user)
        {
            return user.IsInRole(Roles.SystemAdmin);
        }

        public static bool IsAnonymous(this ClaimsPrincipal user)
        {
            return user.Identity?.IsAuthenticated != true;
        }

        /// <returns>Whether the principal is a super admin or system admin.</returns>
        public static bool IsPowerAdmin(this ClaimsPrincipal user)
        {
            return user.IsSuperAdmin() || user.IsSystemAdmin();
        }
    }
}