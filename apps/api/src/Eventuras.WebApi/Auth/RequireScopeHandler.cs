using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace Eventuras.WebApi.Auth;

public class ScopeRequirement : IAuthorizationRequirement
{
    public ScopeRequirement(string issuer, string scope)
    {
        Issuer = issuer ?? throw new ArgumentNullException(nameof(issuer));
        Scope = scope ?? throw new ArgumentNullException(nameof(scope));
    }

    public string Issuer { get; }
    public string Scope { get; }
}

public class RequireScopeHandler : AuthorizationHandler<ScopeRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, ScopeRequirement requirement)
    {
        var scopeClaim = context.User.FindFirst(c => c.Type == "scope" && c.Issuer == requirement.Issuer);
        if (scopeClaim == null || string.IsNullOrEmpty(scopeClaim.Value))
        {
            return Task.CompletedTask;
        }

        if (scopeClaim.Value.Split(' ').Any(s => s == requirement.Scope))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
