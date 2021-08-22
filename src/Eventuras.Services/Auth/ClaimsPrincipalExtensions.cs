using System.Linq;
using System.Security.Claims;

namespace Eventuras.Services.Auth
{
    public static class ClaimsPrincipalExtensions
    {
        public static string GetUserId(this ClaimsPrincipal user)
        {
            return user.FindFirstValue(ClaimTypes.NameIdentifier);
        }

        public static string GetEmail(this ClaimsPrincipal user)
        {
            return user.FindFirstValue(ClaimTypes.Email);
        }

        public static string GetName(this ClaimsPrincipal user)
        {
            return user.FindFirstValue(ClaimTypes.Name);
        }

        public static string GetMobilePhone(this ClaimsPrincipal user)
        {
            return user.FindFirstValue(ClaimTypes.MobilePhone);
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
