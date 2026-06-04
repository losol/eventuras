using System.Security.Claims;
using Eventuras.WebApi.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Xunit;

namespace Eventuras.WebApi.Tests.Auth;

public class JwtBearerConfigurationTests
{
    private const string Issuer = "https://auth.example.test/realms/test";
    private const string Audience = "https://example.test/api";
    private const string Secret = "test-signing-secret-which-is-long-enough";

    private static JwtBearerOptions BuildOptions(string roleClaimType)
    {
        var services = new ServiceCollection();
        services.AddOptions();
        services.AddAuthentication()
            .AddJwtBearerConfiguration(Issuer, Audience, Secret, roleClaimType);

        using var provider = services.BuildServiceProvider();
        return provider.GetRequiredService<IOptionsMonitor<JwtBearerOptions>>()
            .Get(JwtBearerDefaults.AuthenticationScheme);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Defaults_To_Microsoft_Role_Claim_When_Blank(string roleClaimType)
    {
        // Auth0 deployments leave Auth:RoleClaimType unset and rely on the
        // Microsoft role URI; whitespace-only values (e.g. env-var quoting)
        // must also fall back rather than become an invalid claim type.
        var options = BuildOptions(roleClaimType);

        Assert.Equal(ClaimTypes.Role, options.TokenValidationParameters.RoleClaimType);
    }

    [Theory]
    [InlineData("roles")]
    [InlineData(" roles ")]
    public void Applies_Configured_Role_Claim_Type_Trimmed(string roleClaimType)
    {
        // Keycloak deployments set Auth:RoleClaimType=roles.
        var options = BuildOptions(roleClaimType);

        Assert.Equal("roles", options.TokenValidationParameters.RoleClaimType);
    }
}
