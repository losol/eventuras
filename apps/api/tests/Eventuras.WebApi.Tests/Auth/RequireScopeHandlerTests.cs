using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Eventuras.WebApi.Auth;
using Microsoft.AspNetCore.Authorization;
using Xunit;

namespace Eventuras.WebApi.Tests.Auth;

public class RequireScopeHandlerTests
{
    private const string Issuer = "https://auth.example.test/realms/test";

    private static async Task<bool> HandleAsync(string scopeValue, string claimIssuer, string requiredScope)
    {
        var requirement = new ScopeRequirement(Issuer, requiredScope);
        var claims = scopeValue is null
            ? Array.Empty<Claim>()
            : new[] { new Claim("scope", scopeValue, ClaimValueTypes.String, claimIssuer) };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));
        var context = new AuthorizationHandlerContext(new[] { requirement }, principal, resource: null);

        await new RequireScopeHandler().HandleAsync(context);
        return context.HasSucceeded;
    }

    [Fact]
    public async Task Grants_When_Required_Scope_Present() =>
        Assert.True(await HandleAsync("eventuras:admin", Issuer, "eventuras:admin"));

    // Both Auth0 and Keycloak emit a single space-delimited "scope" claim.
    [Fact]
    public async Task Grants_When_Scope_Among_Space_Delimited() =>
        Assert.True(await HandleAsync("openid profile eventuras:admin", Issuer, "eventuras:admin"));

    // The Issuer filter is exact: a trailing-slash difference denies silently.
    [Fact]
    public async Task Denies_When_Issuer_Mismatches() =>
        Assert.False(await HandleAsync("eventuras:admin", Issuer + "/", "eventuras:admin"));

    [Fact]
    public async Task Denies_When_Scope_Claim_Absent() =>
        Assert.False(await HandleAsync(null, Issuer, "eventuras:admin"));
}
