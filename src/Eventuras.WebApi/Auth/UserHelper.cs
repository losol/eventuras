using System.Security.Claims;

namespace Eventuras.WebApi.Auth
{
    public static class UserHelpers
    {
        public static string GetId(this ClaimsPrincipal principal)
        {
            var userIdClaim = principal.FindFirst(c => c.Type == ClaimTypes.NameIdentifier) ?? principal.FindFirst(c => c.Type == "sub");
            if (userIdClaim != null && !string.IsNullOrEmpty(userIdClaim.Value))
            {
                return userIdClaim.Value;
            }

            return null;
        }


        public static string GetEmail(this ClaimsPrincipal principal)
        {
            var standardClaimEmail = principal.FindFirst(System.Security.Claims.ClaimTypes.Email);
            if (standardClaimEmail != null && !string.IsNullOrEmpty(standardClaimEmail.Value))
            {
                return standardClaimEmail.Value;
            }

            var userEmailClaim = principal.FindFirst(Constants.Auth.EmailClaimType);
            if (userEmailClaim != null && !string.IsNullOrEmpty(userEmailClaim.Value))
            {
                return userEmailClaim.Value;
            }

            return null;
        }
    }
}