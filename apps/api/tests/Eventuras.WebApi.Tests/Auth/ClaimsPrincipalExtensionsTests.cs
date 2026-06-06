using System.Linq;
using System.Security.Claims;
using Eventuras.Services;
using Eventuras.Services.Auth;
using Xunit;

namespace Eventuras.WebApi.Tests.Auth;

public class ClaimsPrincipalExtensionsTests
{
    [Fact]
    public void Reads_Raw_Oidc_Claims_When_Inbound_Mapping_Is_Disabled()
    {
        var identity = new ClaimsIdentity(
            new[]
            {
                new Claim("email", "person@example.test"),
                new Claim("name", "Test Person"),
                new Claim("phone_number", "+4712345678"),
                new Claim("roles", Roles.Admin)
            },
            "Test",
            "name",
            "roles");

        var principal = new ClaimsPrincipal(identity);

        Assert.Equal("person@example.test", principal.GetEmail());
        Assert.Equal("Test Person", principal.GetName());
        Assert.Equal("+4712345678", principal.GetMobilePhone());
        Assert.True(principal.IsAdmin());
        Assert.Equal(new[] { Roles.Admin }, principal.GetRoles().ToArray());
    }
}
