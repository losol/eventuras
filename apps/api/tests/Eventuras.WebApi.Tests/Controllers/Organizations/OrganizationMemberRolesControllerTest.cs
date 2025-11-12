using System;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Services;
using Eventuras.TestAbstractions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Organizations;

public class OrganizationMemberRolesControllerTest : IClassFixture<CustomWebApiApplicationFactory<Program>>
{
    private readonly CustomWebApiApplicationFactory<Program> _factory;

    public OrganizationMemberRolesControllerTest(CustomWebApiApplicationFactory<Program> factory) =>
        _factory = factory ?? throw new ArgumentNullException(nameof(factory));

    [Fact]
    public async Task Should_Require_Auth_To_List_Roles()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/v3/organizations/1/members/test/roles");
        response.CheckUnauthorized();
    }

    [Theory]
    [InlineData(Roles.Admin)]
    [InlineData(Roles.SuperAdmin)]
    public async Task Should_Require_System_Admin_Role_To_List_Roles(string role)
    {
        var client = _factory.CreateClient()
            .Authenticated(role: role);
        var response = await client.GetAsync("/v3/organizations/1/members/test/roles");
        response.CheckForbidden();
    }

    [Fact]
    public async Task List_Should_Return_Not_Found_For_Non_Existing_Org_Id()
    {
        var client = _factory.CreateClient()
            .AuthenticatedAsSystemAdmin();
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        var response = await client.GetAsync($"/v3/organizations/999/members/{user.Entity.Id}/roles");
        response.CheckNotFound();
    }

    [Fact]
    public async Task List_Should_Return_Not_Found_For_Non_Existing_User_Id()
    {
        var client = _factory.CreateClient()
            .AuthenticatedAsSystemAdmin();
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        var response = await client.GetAsync($"/v3/organizations/{org.Entity.OrganizationId}/members/any/roles");
        response.CheckNotFound();
    }

    [Fact]
    public async Task Should_Return_Empty_List_If_Not_A_Member_Of_The_Org()
    {
        var client = _factory.CreateClient()
            .AuthenticatedAsSystemAdmin();

        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var user = await scope.CreateUserAsync();

        var response =
            await client.GetAsync($"/v3/organizations/{org.Entity.OrganizationId}/members/{user.Entity.Id}/roles");
        response.CheckOk();

        var json = await response.AsArrayAsync();
        json.CheckEmptyArray();
    }

    [Fact]
    public async Task Should_Return_Empty_List_If_No_Roles()
    {
        var client = _factory.CreateClient()
            .AuthenticatedAsSystemAdmin();

        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var user = await scope.CreateUserAsync(organization: org.Entity);

        var response =
            await client.GetAsync($"/v3/organizations/{org.Entity.OrganizationId}/members/{user.Entity.Id}/roles");
        response.CheckOk();

        var json = await response.AsArrayAsync();
        json.CheckEmptyArray();
    }

    [Fact]
    public async Task Should_Return_List_Of_Roles()
    {
        var client = _factory.CreateClient()
            .AuthenticatedAsSystemAdmin();

        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var anotherOrg = await scope.CreateOrganizationAsync();
        using var user = await scope.CreateUserAsync();
        using var member = await scope.CreateOrganizationMemberAsync(
            user.Entity, org.Entity,
            roles: new[] { Roles.Admin, Roles.SuperAdmin });
        using var anotherMember = await scope.CreateOrganizationMemberAsync(user.Entity, anotherOrg.Entity,
            roles: new[] { Roles.SystemAdmin });

        var response =
            await client.GetAsync($"/v3/organizations/{org.Entity.OrganizationId}/members/{user.Entity.Id}/roles");
        response.CheckOk();

        var json = await response.AsArrayAsync();
        json.CheckArray((token, role) => Assert.Equal(role, token.ToString()),
            Roles.Admin, Roles.SuperAdmin);

        response =
            await client.GetAsync(
                $"/v3/organizations/{anotherOrg.Entity.OrganizationId}/members/{user.Entity.Id}/roles");
        response.CheckOk();

        json = await response.AsArrayAsync();
        json.CheckArray((token, role) => Assert.Equal(role, token.ToString()),
            Roles.SystemAdmin);
    }

    [Fact]
    public async Task Should_Require_Auth_To_Add_Role()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsync("/v3/organizations/1/members/test/roles", new { });
        response.CheckUnauthorized();
    }

    [Theory]
    [InlineData(Roles.Admin)]
    [InlineData(Roles.SuperAdmin)]
    public async Task Should_Require_System_Admin_Role_To_Add_Role(string role)
    {
        var client = _factory.CreateClient()
            .Authenticated(role: role);
        var response = await client.PostAsync("/v3/organizations/1/members/test/roles", new { });
        response.CheckForbidden();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("unknown")]
    public async Task Add_Should_Validate_Role(string value)
    {
        var client = _factory.CreateClient()
            .AuthenticatedAsSystemAdmin();
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var user = await scope.CreateUserAsync();
        var response = await client.PostAsync(
            $"/v3/organizations/{org.Entity.OrganizationId}/members/{user.Entity.Id}/roles", new { role = value });
        response.CheckBadRequest();
    }

    [Fact]
    public async Task Add_Should_Return_Not_Found_For_Non_Existing_Org_Id()
    {
        var client = _factory.CreateClient()
            .AuthenticatedAsSystemAdmin();
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        var response = await client.PostAsync($"/v3/organizations/1/members/{user.Entity.Id}/roles",
            new { role = Roles.Admin });
        response.CheckNotFound();
    }

    [Fact]
    public async Task Add_Should_Return_Not_Found_For_Non_Existing_User_Id()
    {
        var client = _factory.CreateClient()
            .AuthenticatedAsSystemAdmin();
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        var response = await client.PostAsync($"/v3/organizations/{org.Entity.OrganizationId}/members/any/roles",
            new { role = Roles.Admin });
        response.CheckNotFound();
    }

    [Fact]
    public async Task Add_Should_Return_Not_Found_For_Non_Member()
    {
        var client = _factory.CreateClient()
            .AuthenticatedAsSystemAdmin();
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var user = await scope.CreateUserAsync();
        var response = await client.PostAsync(
            $"/v3/organizations/{org.Entity.OrganizationId}/members/{user.Entity.Id}/roles",
            new { role = Roles.Admin });
        response.CheckNotFound();
    }

    [Fact]
    public async Task Should_Add_New_Role()
    {
        var client = _factory.CreateClient()
            .AuthenticatedAsSystemAdmin();

        using var scope = _factory.Services.NewTestScope();

        using var org = await scope.CreateOrganizationAsync();
        using var user = await scope.CreateUserAsync();
        using var member = await scope.CreateOrganizationMemberAsync(user.Entity, org.Entity);
        Assert.Null(member.Entity.Roles);

        var response = await client.PostAsync(
            $"/v3/organizations/{org.Entity.OrganizationId}/members/{user.Entity.Id}/roles",
            new { role = Roles.Admin });
        response.CheckOk();

        var token = await response.AsArrayAsync();
        token.CheckStringArray(Roles.Admin);

        var updated = await scope.Db.OrganizationMembers
            .AsNoTracking()
            .Include(m => m.Roles)
            .SingleOrDefaultAsync(m => m.OrganizationId == org.Entity.OrganizationId &&
                                       m.UserId == user.Entity.Id);

        Assert.NotNull(updated);
        Assert.NotNull(updated.Roles);
        Assert.Contains(updated.Roles, r => r.Role == Roles.Admin);
    }

    [Fact]
    public async Task Should_Return_Ok_If_Role_Already_Added()
    {
        var client = _factory.CreateClient()
            .AuthenticatedAsSystemAdmin();

        using var scope = _factory.Services.NewTestScope();

        using var org = await scope.CreateOrganizationAsync();
        using var user = await scope.CreateUserAsync();
        using var member = await scope.CreateOrganizationMemberAsync(
            user.Entity, org.Entity, role: Roles.Admin);
        Assert.Single(member.Entity.Roles);
        Assert.Equal(Roles.Admin, member.Entity.Roles.First().Role);

        var response = await client.PostAsync(
            $"/v3/organizations/{org.Entity.OrganizationId}/members/{user.Entity.Id}/roles",
            new { role = Roles.Admin });
        response.CheckOk();

        var token = await response.AsArrayAsync();
        token.CheckStringArray(Roles.Admin);

        var updated = await scope.Db.OrganizationMembers
            .AsNoTracking()
            .Include(m => m.Roles)
            .SingleOrDefaultAsync(m => m.OrganizationId == org.Entity.OrganizationId &&
                                       m.UserId == user.Entity.Id);

        Assert.NotNull(updated);
        Assert.NotNull(updated.Roles);
        Assert.Contains(updated.Roles, r => r.Role == Roles.Admin);
    }

    [Fact]
    public async Task Should_Require_Auth_To_Remove_Role()
    {
        var client = _factory.CreateClient();
        var response = await client.DeleteAsync("/v3/organizations/1/members/test/roles");
        response.CheckUnauthorized();
    }

    [Theory]
    [InlineData(Roles.Admin)]
    [InlineData(Roles.SuperAdmin)]
    public async Task Should_Require_System_Admin_Role_To_Remove_Role(string role)
    {
        var client = _factory.CreateClient()
            .Authenticated(role: role);
        var response = await client.DeleteAsync("/v3/organizations/1/members/test/roles");
        response.CheckForbidden();
    }

    [Fact]
    public async Task Remove_Should_Return_Not_Found_For_Non_Existing_Org_Id()
    {
        var client = _factory.CreateClient()
            .AuthenticatedAsSystemAdmin();
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        var response = await client.DeleteAsync($"/v3/organizations/1001/members/{user.Entity.Id}/roles",
            new { role = Roles.Admin });
        response.CheckNotFound();
    }

    [Fact]
    public async Task Remove_Should_Return_Not_Found_For_Non_Existing_User_Id()
    {
        var client = _factory.CreateClient()
            .AuthenticatedAsSystemAdmin();
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        var response = await client.DeleteAsync($"/v3/organizations/{org.Entity.OrganizationId}/members/any/roles",
            new { role = Roles.Admin });
        response.CheckNotFound();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("unknown")]
    public async Task Remove_Should_Validate_Role(string value)
    {
        var client = _factory.CreateClient()
            .AuthenticatedAsSystemAdmin();
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var user = await scope.CreateUserAsync();
        var response = await client.DeleteAsync(
            $"/v3/organizations/{org.Entity.OrganizationId}/members/{user.Entity.Id}/roles", new { role = value });
        response.CheckBadRequest();
    }

    [Fact]
    public async Task Should_Remove_Role()
    {
        var client = _factory.CreateClient()
            .AuthenticatedAsSystemAdmin();

        using var scope = _factory.Services.NewTestScope();

        var org = await scope.CreateOrganizationAsync();
        using var user = await scope.CreateUserAsync();
        var member = await scope.CreateOrganizationMemberAsync(
            user.Entity, org.Entity, role: Roles.Admin);
        Assert.Single(member.Entity.Roles);
        Assert.Equal(Roles.Admin, member.Entity.Roles.First().Role);

        var response = await client.DeleteAsync(
            $"/v3/organizations/{org.Entity.OrganizationId}/members/{user.Entity.Id}/roles",
            new { role = Roles.Admin });
        response.CheckOk();

        var token = await response.AsArrayAsync();
        token.CheckEmptyArray();

        var updated = await scope.Db.OrganizationMembers
            .AsNoTracking()
            .Include(m => m.Roles)
            .SingleOrDefaultAsync(m => m.OrganizationId == org.Entity.OrganizationId &&
                                       m.UserId == user.Entity.Id);

        Assert.NotNull(updated);
        Assert.NotNull(updated.Roles);
        Assert.Empty(updated.Roles);
    }

    [Fact]
    public async Task Should_Return_Ok_If_No_Role_Added_Before_Removal()
    {
        var client = _factory.CreateClient()
            .AuthenticatedAsSystemAdmin();

        using var scope = _factory.Services.NewTestScope();

        using var org = await scope.CreateOrganizationAsync();
        using var user = await scope.CreateUserAsync();
        using var member = await scope.CreateOrganizationMemberAsync(user.Entity, org.Entity);
        Assert.Null(member.Entity.Roles);

        var response = await client.DeleteAsync(
            $"/v3/organizations/{org.Entity.OrganizationId}/members/{user.Entity.Id}/roles",
            new { role = Roles.Admin });
        response.CheckOk();

        var token = await response.AsArrayAsync();
        token.CheckEmptyArray();

        var updated = await scope.Db.OrganizationMembers
            .AsNoTracking()
            .Include(m => m.Roles)
            .SingleOrDefaultAsync(m => m.OrganizationId == org.Entity.OrganizationId &&
                                       m.UserId == user.Entity.Id);

        Assert.NotNull(updated);
        Assert.NotNull(updated.Roles);
        Assert.Empty(updated.Roles);
    }
}
