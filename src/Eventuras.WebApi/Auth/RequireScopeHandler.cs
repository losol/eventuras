using Microsoft.AspNetCore.Authorization;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Eventuras.WebApi.Auth
{

    public class ScopeRequirement : IAuthorizationRequirement
    {
        public string Issuer { get; }
        public string Scope { get; }

        public ScopeRequirement(string issuer, string scope)
        {
            Issuer = issuer ?? throw new ArgumentNullException(nameof(issuer));
            Scope = scope ?? throw new ArgumentNullException(nameof(scope));
        }
    }

    public class RequireScopeHandler : AuthorizationHandler<ScopeRequirement>
    {
        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, ScopeRequirement requirement)
        {
            var scopeClaim = context.User.FindFirst(c => c.Type == "scope" && c.Issuer == requirement.Issuer);
            if (scopeClaim == null || String.IsNullOrEmpty(scopeClaim.Value))
                return Task.CompletedTask;

            if (scopeClaim.Value.Split(' ').Any(s => s == requirement.Scope))
                context.Succeed(requirement);
            return Task.CompletedTask;
        }
    }
}