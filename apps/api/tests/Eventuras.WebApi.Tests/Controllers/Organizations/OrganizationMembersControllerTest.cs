using System;
using System.Threading.Tasks;
using Eventuras.Services;
using Eventuras.TestAbstractions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Organizations;

public class OrganizationMembersControllerTest : IClassFixture<CustomWebApiApplicationFactory<Program>>
{
    private readonly CustomWebApiApplicationFactory<Program> _factory;

    public OrganizationMembersControllerTest(CustomWebApiApplicationFactory<Program> factory) =>
        _factory = factory ?? throw new ArgumentNullException(nameof(factory));

    [Fact]
    public async Task Should_Require_Auth_To_Add_New_Member_To_The_Org()
    {
        var client = _factory.CreateClient();
        var response = await client.PutAsync("/v3/organizations/1/members/any", new { });
        response.CheckUnauthorized();
    }

    [Theory]
    [InlineData(null)]
    [InlineData(Roles.Admin)]
    [InlineData(Roles.SuperAdmin)]
    public async Task Should_Not_Allow_To_Add_Member_To_Org_To_Anyone_Except_System_Admin(string role)
    {
        var client = _factory.CreateClient()
            .Authenticated(role: role);
        var response = await client.PutAsync("/v3/organizations/1/members/any", new { });
        response.CheckForbidden();
    }

    [Fact]
    public async Task Should_Return_Not_Found_When_Adding_New_Member_To_Non_Existing_Org()
    {
        var client = _factory.CreateClient()
            .AuthenticatedAsSystemAdmin();
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        var response = await client.PutAsync($"/v3/organizations/10001/members/{user.Entity.Id}", new { });
        response.CheckNotFound();
    }

    [Fact]
    public async Task Should_Return_Not_Found_When_Adding_Unknown_Member_To_Existing_Org()
    {
        var client = _factory.CreateClient()
            .AuthenticatedAsSystemAdmin();
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        var response =
            await client.PutAsync($"/v3/organizations/{org.Entity.OrganizationId}/members/any", new { });
        response.CheckNotFound();
    }

    [Fact]
    public async Task Should_Add_New_Member_To_Org()
    {
        using var scope = _factory.Services.NewTestScope();

        using var systemAdminUser = await scope.CreateUserAsync(roles: new[] { Roles.SystemAdmin });
        var client = _factory.CreateClient().AuthenticatedAs(systemAdminUser.Entity, Roles.SystemAdmin);

        using var user = await scope.CreateUserAsync();
        using var org = await scope.CreateOrganizationAsync();
        var response =
            await client.PutAsync($"/v3/organizations/{org.Entity.OrganizationId}/members/{user.Entity.Id}",
                new { });
        response.CheckOk();

        var member = await scope.Db.OrganizationMembers
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.OrganizationId == org.Entity.OrganizationId &&
                                      m.User.Id == user.Entity.Id);

        Assert.NotNull(member);
    }

    [Fact]
    public async Task Should_Return_Ok_When_Adding_Member_To_Org_Second_Time()
    {
        using var scope = _factory.Services.NewTestScope();

        using var systemAdminUser = await scope.CreateUserAsync(roles: new[] { Roles.SystemAdmin });
        var client = _factory.CreateClient().AuthenticatedAs(systemAdminUser.Entity, Roles.SystemAdmin);

        using var user = await scope.CreateUserAsync();
        using var org = await scope.CreateOrganizationAsync();
        using var m = await scope.CreateOrganizationMemberAsync(user.Entity, org.Entity);

        var response =
            await client.PutAsync($"/v3/organizations/{org.Entity.OrganizationId}/members/{user.Entity.Id}",
                new { });
        response.CheckOk();

        var member = await scope.Db.OrganizationMembers
            .AsNoTracking()
            .SingleOrDefaultAsync(m => m.OrganizationId == org.Entity.OrganizationId &&
                                       m.User.Id == user.Entity.Id);

        Assert.NotNull(member);
        Assert.Equal(m.Entity.Id, member.Id);
    }

    [Fact]
    public async Task Should_Require_Auth_To_Remove_Member_From_The_Org()
    {
        var client = _factory.CreateClient();
        var response = await client.DeleteAsync("/v3/organizations/1/members/any");
        response.CheckUnauthorized();
    }

    [Theory]
    [InlineData(null)]
    [InlineData(Roles.Admin)]
    [InlineData(Roles.SuperAdmin)]
    public async Task Should_Not_Allow_To_Remove_Org_Member_To_Anyone_Except_System_Admin(string role)
    {
        var client = _factory.CreateClient()
            .Authenticated(role: role);
        var response = await client.DeleteAsync("/v3/organizations/1/members/any");
        response.CheckForbidden();
    }

    [Fact]
    public async Task Should_Return_Not_Found_When_Removing_Member_From_Non_Existing_Org()
    {
        var client = _factory.CreateClient()
            .AuthenticatedAsSystemAdmin();
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        var response = await client.DeleteAsync($"/v3/organizations/10001/members/{user.Entity.Id}");
        response.CheckNotFound();
    }

    [Fact]
    public async Task Should_Return_Not_Found_When_Removing_Unknown_Member_From_Existing_Org()
    {
        var client = _factory.CreateClient()
            .AuthenticatedAsSystemAdmin();
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        var response =
            await client.DeleteAsync($"/v3/organizations/{org.Entity.OrganizationId}/members/any");
        response.CheckNotFound();
    }

    [Fact]
    public async Task Should_Remove_Member_From_Org()
    {
        using var scope = _factory.Services.NewTestScope();

        using var systemAdminUser = await scope.CreateUserAsync(roles: new[] { Roles.SystemAdmin });
        var client = _factory.CreateClient().AuthenticatedAs(systemAdminUser.Entity, Roles.SystemAdmin);

        using var user = await scope.CreateUserAsync();
        var org = await scope.CreateOrganizationAsync();
        await scope.CreateOrganizationMemberAsync(user.Entity, org.Entity);

        var response =
            await client.DeleteAsync($"/v3/organizations/{org.Entity.OrganizationId}/members/{user.Entity.Id}");
        response.CheckOk();

        var member = await scope.Db.OrganizationMembers
            .AsNoTracking()
            .SingleOrDefaultAsync(m => m.OrganizationId == org.Entity.OrganizationId &&
                                       m.User.Id == user.Entity.Id);

        Assert.Null(member);
    }

    [Fact]
    public async Task Should_Return_Ok_When_Removing_Member_From_Org_Second_Time()
    {
        using var scope = _factory.Services.NewTestScope();

        using var systemAdminUser = await scope.CreateUserAsync(roles: new[] { Roles.SystemAdmin });
        var client = _factory.CreateClient().AuthenticatedAs(systemAdminUser.Entity, Roles.SystemAdmin);

        using var user = await scope.CreateUserAsync();
        using var org = await scope.CreateOrganizationAsync();

        var response =
            await client.DeleteAsync($"/v3/organizations/{org.Entity.OrganizationId}/members/{user.Entity.Id}");
        response.CheckOk();

        Assert.False(await scope.Db.OrganizationMembers
            .AnyAsync(m => m.OrganizationId == org.Entity.OrganizationId &&
                           m.User.Id == user.Entity.Id));
    }
}
