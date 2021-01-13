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

        public static bool IsAdmin(this ClaimsPrincipal user)
        {
            return new[] { Roles.Admin, Roles.SuperAdmin }.Any(user.IsInRole);
        }

        public static bool IsSuperAdmin(this ClaimsPrincipal user)
        {
            return user.IsInRole(Roles.SuperAdmin);
        }

        public static bool IsAnonymous(this ClaimsPrincipal user)
        {
            return user.Identity?.IsAuthenticated != true;
        }
    }
}
