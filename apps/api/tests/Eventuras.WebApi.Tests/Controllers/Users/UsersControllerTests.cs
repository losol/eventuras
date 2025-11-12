using System;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services;
using Eventuras.TestAbstractions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Users;

public class UsersControllerTests : IClassFixture<CustomWebApiApplicationFactory<Program>>, IDisposable
{
    private readonly CustomWebApiApplicationFactory<Program> _factory;

    public UsersControllerTests(CustomWebApiApplicationFactory<Program> factory)
    {
        _factory = factory;
        Cleanup();
    }

    public void Dispose() => Cleanup();

    private void Cleanup()
    {
        using var scope = _factory.Services.NewTestScope();
        scope.Db.Users.Clean();
        scope.Db.SaveChanges();
    }

    [Fact]
    public async Task Profile_Endpoint_Should_Return_Unauthorized_For_Not_Logged_In_User()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/v3/users/me");
        response.CheckUnauthorized();
    }

    [Fact]
    public async Task Profile_Endpoint_Should_Return_Information_For_Regular_User()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();

        var client = _factory.CreateClient()
            .AuthenticatedAs(user.Entity);

        var response = await client.GetAsync("/v3/users/me");
        response.CheckOk();

        var json = await response.Content.ReadAsStringAsync();
        var token = await response.AsTokenAsync();
        token.CheckUser(user.Entity);
    }

    [Fact]
    public async Task Profile_Endpoint_Should_Create_And_Return_Information_For_Not_Existing_User()
    {
        using var scope = _factory.Services.NewTestScope();

        var user = new ApplicationUser { Email = "test@email.com", PhoneNumber = "+120123456789" };

        var client = _factory.CreateClient().AuthenticatedAs(user);

        var response = await client.GetAsync("/v3/userprofile");
        response.CheckOk();

        Assert.Contains(scope.Db.Users, u => u.Email == user.Email);
        var dbUser = scope.Db.Users.First(u => u.Email == user.Email);

        var token = await response.AsTokenAsync();
        token.CheckUser(dbUser);
    }

    [Theory]
    [InlineData(Roles.Admin)]
    [InlineData(Roles.SuperAdmin)]
    public async Task Profile_Endpoint_Should_Return_Information_For_The_Currently_Signed_In_User(string role)
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync(role: role);

        var client = _factory.CreateClient()
            .AuthenticatedAs(user.Entity);

        var response = await client.GetAsync("/v3/users/me");
        response.CheckOk();

        var json = await response.Content.ReadAsStringAsync();
        var token = await response.AsTokenAsync();
        token.CheckUser(user.Entity);
    }

    [Fact]
    public async Task Get_Endpoint_Should_Return_Unauthorized_For_Not_Logged_In_User()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync($"/v3/users/{Guid.NewGuid()}");
        response.CheckUnauthorized();
    }

    [Fact]
    public async Task Get_Endpoint_Should_Return_Information_For_Current_User()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();

        var client = _factory.CreateClient()
            .AuthenticatedAs(user.Entity);

        var response = await client.GetAsync($"/v3/users/{user.Entity.Id}");
        response.CheckOk();

        var json = await response.Content.ReadAsStringAsync();
        var token = await response.AsTokenAsync();
        token.CheckUser(user.Entity);
    }

    [Fact]
    public async Task Get_Endpoint_Should_Return_Forbidden_For_Regular_User()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();

        var client = _factory.CreateClient()
            .AuthenticatedAs(user.Entity);

        var response = await client.GetAsync($"/v3/users/{Guid.NewGuid()}");
        response.CheckForbidden();
    }

    [Theory]
    [InlineData(Roles.Admin)]
    [InlineData(Roles.SuperAdmin)]
    [InlineData(Roles.SystemAdmin)]
    public async Task Get_Endpoint_Should_Return_Data_For_Admin(string role)
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();

        var client = _factory.CreateClient()
            .Authenticated(role: role);

        var response = await client.GetAsync($"/v3/users/{user.Entity.Id}");
        response.CheckOk();

        var json = await response.AsTokenAsync();
        json.CheckUser(user.Entity);
    }

    [Fact]
    public async Task List_Users_Should_Return_Unauthorized_For_Not_Logged_In_User()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/v3/users");
        response.CheckUnauthorized();
    }

    [Fact]
    public async Task List_Users_Should_Return_Forbidden_For_Non_Admin()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();

        var client = _factory.CreateClient()
            .AuthenticatedAs(user.Entity);

        var response = await client.GetAsync("/v3/users");
        response.CheckForbidden();
    }

    [Fact]
    public async Task List_Users_Should_Return_Empty_List()
    {
        using var scope = _factory.Services.NewTestScope();

        var client = _factory.CreateClient()
            .Authenticated(role: Roles.SuperAdmin);

        var response = await client.GetAsync("/v3/users");
        response.CheckOk();

        var json = await response.AsTokenAsync();
        json.CheckEmptyPaging();
    }

    [Theory]
    [MemberData(nameof(GetInvalidListQueryParams))]
    public async Task List_Users_Should_Validate_Query_Params(string query)
    {
        var client = _factory.CreateClient()
            .Authenticated(role: Roles.Admin);

        var response = await client.GetAsync($"/v3/users?{query}");
        response.CheckBadRequest();
    }

    public static object[][] GetInvalidListQueryParams() =>
        new[]
        {
            new object[] { "page=-1" }, new object[] { "page=0" }, new object[] { "page=asd" },
            new object[] { "count=-1" }, new object[] { "count=asd" }, new object[] { "order=1001" },
            new object[] { "order=invalid" }, new object[] { "descending=invalid" }
        };

    [Theory]
    [InlineData(Roles.Admin)]
    [InlineData(Roles.SystemAdmin)]
    public async Task List_Users_Should_Use_Paging(string role)
    {
        using var scope = _factory.Services.NewTestScope();

        var client = _factory.CreateClient()
            .Authenticated(role: role);

        using var user3 = await scope.CreateUserAsync(email: "asdf@asdf.com");
        using var user2 = await scope.CreateUserAsync(email: "qwer@qwer.com");
        using var user1 = await scope.CreateUserAsync(email: "zxcv@zxcv.com");

        var response = await client.GetAsync("/v3/users?page=1&count=2");
        response.CheckOk();

        response = await client.GetAsync("/v3/users?page=2&count=2");
        response.CheckOk();
    }


    [Fact]
    public async Task List_Should_Filter_By_Query_Param()
    {
        using var scope = _factory.Services.NewTestScope();

        var client = _factory.CreateClient()
            .Authenticated(role: Roles.Admin);

        using var user5 =
            await scope.CreateUserAsync("Test Person 5", email: "other@email.com", phone: null); // no phone
        using var user4 =
            await scope.CreateUserAsync("Test Person 4", email: "testperson4@email.com", phone: "+1234567890");
        using var user3 =
            await scope.CreateUserAsync("Test Person 3", email: "testperson3@email.com", phone: "+11122223333444");
        using var user2 =
            await scope.CreateUserAsync("Test Person 2", email: "testperson2@email.com", phone: "+2222222221");
        using var user1 =
            await scope.CreateUserAsync("Test Person 1", email: "testperson1@email.com", phone: "+11111111111");

        // 1. search by name (case-insensitive)
        await CheckListAsync(client, new { query = "Test Person" }, user1, user2, user3, user4, user5);
        await CheckListAsync(client, new { query = "test person" }, user1, user2, user3, user4, user5);

        // 2. search by email (case-insensitive)
        await CheckListAsync(client, new { query = "email" }, user1, user2, user3, user4, user5);
        await CheckListAsync(client, new { query = "EMAIL" }, user1, user2, user3, user4, user5);
        await CheckListAsync(client, new { query = "testperson" }, user1, user2, user3, user4);

        // 3. search by phone
        await CheckListAsync(client, new { query = "123" }, user4);
        await CheckListAsync(client, new { query = "111" }, user1, user3);
        await CheckListAsync(client, new { query = "1" }, user1, user2, user3, user4);
        await CheckListAsync(client, new { query = "+1" }, user1, user3, user4);
        await CheckListAsync(client, new { query = "2222" }, user2, user3);
        await CheckListAsync(client, new { query = "444" }, user3);
    }

    private static async Task CheckListAsync(
        HttpClient client,
        object queryParams,
        params IDisposableEntity<ApplicationUser>[] users)
    {
        var response = await client.GetAsync("/v3/users", queryParams);
        response.CheckOk();

        var json = await response.AsTokenAsync();
        json.CheckPaging((token, u) => token.CheckUser(u.Entity), users);
    }

    [Fact]
    public async Task List_Should_Use_Order_Param()
    {
        using var scope = _factory.Services.NewTestScope();

        var client = _factory.CreateClient()
            .Authenticated(role: Roles.Admin);

        using var user5 = await scope.CreateUserAsync("e", email: "other@email.com", phone: null); // no phone
        using var user4 = await scope.CreateUserAsync("d", email: "testperson1@email.com", phone: "+1234567890");
        using var user3 = await scope.CreateUserAsync("c", email: "testperson2@email.com", phone: "+11122223333444");
        using var user2 = await scope.CreateUserAsync("b", email: "testperson3@email.com", phone: "+2222222221");
        using var user1 = await scope.CreateUserAsync("a", email: "testperson4@email.com", phone: "+11111111111");

        // 1. default
        await CheckListAsync(client, new { }, user1, user2, user3, user4, user5);
        await CheckListAsync(client, new { order = "email" }, user5, user4, user3, user2, user1);
        await CheckListAsync(client, new { order = "phone" }, user5, user1, user3, user4, user2);

        // 2. ascending
        await CheckListAsync(client, new { descending = false }, user1, user2, user3, user4, user5);
        await CheckListAsync(client, new { order = "email", descending = false }, user5, user4, user3, user2, user1);
        await CheckListAsync(client, new { order = "phone", descending = false }, user5, user1, user3, user4, user2);

        // 3. descending
        await CheckListAsync(client, new { descending = true }, user5, user4, user3, user2, user1);
        await CheckListAsync(client, new { order = "email", descending = true }, user1, user2, user3, user4, user5);
        await CheckListAsync(client, new { order = "phone", descending = true }, user2, user4, user3, user1, user5);
    }

    [Fact]
    public async Task Create_New_User_Should_Return_Unauthorized_For_Not_Logged_In_User()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsync("/v3/users", new { });
        response.CheckUnauthorized();
    }

    [Fact]
    public async Task Create_New_User_Should_Return_Forbidden_For_Non_Admin()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();

        var client = _factory.CreateClient()
            .AuthenticatedAs(user.Entity);

        var response = await client.PostAsync("/v3/users", new { });
        response.CheckForbidden();
    }

    [Fact]
    public async Task Create_New_User_Should_Return_Conflict_If_Email_Is_Registered()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync(email: "test@email.com");

        var client = _factory.CreateClient()
            .AuthenticatedAsSuperAdmin();

        var response = await client.PostAsync("/v3/users", new { email = "test@email.com" });

        response.CheckConflict();
    }

    [Fact]
    public async Task Create_New_User_Should_Return_Conflict_If_Existing_Email_Is_Archived()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync(email: "test@email.com", archived: true);

        var client = _factory.CreateClient()
            .AuthenticatedAsSuperAdmin();

        var response = await client.PostAsync("/v3/users", new { email = "test@email.com" });

        response.CheckConflict();
    }

    [Fact]
    public async Task Should_Create_New_User()
    {
        var client = _factory.CreateClient()
            .AuthenticatedAsSuperAdmin();

        var response = await client.PostAsync("/v3/users", new { name = "John Doe", email = "test@email.com" });

        response.CheckOk();

        using var scope = _factory.Services.NewTestScope();
        var user = await scope.Db.Users.SingleAsync(u => u.Email == "test@email.com" && !u.Archived);

        var json = await response.AsTokenAsync();
        json.CheckUser(user);
    }

    [Fact]
    public async Task Should_Create_New_User_With_Max_Data()
    {
        var client = _factory.CreateClient()
            .AuthenticatedAsSuperAdmin();

        var response = await client.PostAsync("/v3/users",
            new { givenName = "John", familyName = "Doe", email = "test@email.com", phoneNumber = "+11111111111" });

        response.CheckOk();

        using var scope = _factory.Services.NewTestScope();
        var user = await scope.Db.Users.SingleAsync(u => u.Email == "test@email.com");
        Assert.Equal("John Doe", user.Name);
        Assert.Equal("+11111111111", user.PhoneNumber);
        Assert.False(user.PhoneNumberConfirmed);
        Assert.False(user.Archived);

        var json = await response.AsTokenAsync();
        json.CheckUser(user);
    }

    [Theory]
    [InlineData(Roles.Admin)]
    [InlineData(Roles.SuperAdmin)]
    [InlineData(Roles.SystemAdmin)]
    public async Task Admin_Should_Be_Able_To_Create_New_User(string role)
    {
        var client = _factory.CreateClient()
            .Authenticated(role: role);

        var response = await client.PostAsync("/v3/users", new { name = "John Doe", email = "test@email.com" });

        response.CheckOk();

        using var scope = _factory.Services.NewTestScope();
        var user = await scope.Db.Users.SingleAsync(u => u.Email == "test@email.com");

        var json = await response.AsTokenAsync();
        json.CheckUser(user);
    }

    [Fact]
    public async Task Update_User_Should_Return_Unauthorized_For_Not_Logged_In_User()
    {
        var client = _factory.CreateClient();

        var response = await client.PutAsync($"/v3/users/{Guid.NewGuid()}", new { });
        response.CheckUnauthorized();
    }

    [Fact]
    public async Task Update_User_Should_Return_Forbidden_For_Non_Admin()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();

        var client = _factory.CreateClient()
            .AuthenticatedAs(user.Entity);

        var response = await client.PutAsync($"/v3/users/{Guid.NewGuid()}", new { });
        response.CheckForbidden();
    }

    [Fact]
    public async Task Update_User_Should_Return_Conflict_If_Email_Is_Registered()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync(email: "test@email.com");
        using var otherUser = await scope.CreateUserAsync(email: "another@email.com");

        var client = _factory.CreateClient()
            .AuthenticatedAsSuperAdmin();

        var response = await client.PutAsync($"/v3/users/{user.Entity.Id}",
            new { name = user.Entity.Name, email = otherUser.Entity.Email });

        response.CheckConflict();
    }

    [Fact]
    public async Task Update_User_Should_Not_Return_Conflict_If_Existing_Email_Is_Archived()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync(email: "test@email.com");
        using var otherUser = await scope.CreateUserAsync(email: "another@email.com", archived: true);

        var client = _factory.CreateClient()
            .AuthenticatedAsSuperAdmin();

        var response = await client.PutAsync($"/v3/users/{user.Entity.Id}",
            new { givenName = user.Entity.Name, email = otherUser.Entity.Email });

        response.CheckOk();

        var updateUser = await scope.Db.Users
            .AsNoTracking()
            .SingleAsync(u => u.Id == user.Entity.Id);

        Assert.Equal(updateUser.Name, user.Entity.Name);
        Assert.Equal(updateUser.Email, otherUser.Entity.Email);
        Assert.True(!updateUser.Archived);

        var json = await response.AsTokenAsync();
        json.CheckUser(updateUser);
    }

    [Fact]
    public async Task Should_Update_User_With_Max_Data()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync(phone: null);

        var client = _factory.CreateClient()
            .AuthenticatedAsSuperAdmin();

        var response = await client.PutAsync($"/v3/users/{user.Entity.Id}",
            new { givenName = "John", familyName = "Doe", email = "another@email.com", phoneNumber = "+1234567890" });

        response.CheckOk();

        var updatedUser = await scope.Db.Users
            .AsNoTracking()
            .SingleAsync(u => u.Id == user.Entity.Id);

        Assert.Equal("John Doe", updatedUser.Name);
        Assert.Equal("another@email.com", updatedUser.Email);
        Assert.Equal("+1234567890", updatedUser.PhoneNumber);
        Assert.False(updatedUser.PhoneNumberConfirmed);
        Assert.False(updatedUser.Archived);

        var json = await response.AsTokenAsync();
        json.CheckUser(updatedUser);
    }

    [Theory]
    [InlineData(Roles.Admin)]
    [InlineData(Roles.SuperAdmin)]
    [InlineData(Roles.SystemAdmin)]
    public async Task Admin_Should_Be_Able_To_Update_User(string role)
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();

        var client = _factory.CreateClient()
            .Authenticated(role: role);

        var response = await client.PutAsync($"/v3/users/{user.Entity.Id}",
            new { givenName = "John", familyName = "Doe", email = "another@email.com" });

        response.CheckOk();

        var updatedUser = await scope.Db.Users
            .AsNoTracking()
            .SingleAsync(u => u.Id == user.Entity.Id);

        Assert.Equal("John Doe", updatedUser.Name);
        Assert.Equal("another@email.com", updatedUser.Email);
        Assert.False(updatedUser.Archived);

        var json = await response.AsTokenAsync();
        json.CheckUser(updatedUser);
    }

    public static object[][] GetInvalidUserInput() =>
        new object[][]
        {
            new[] { new { name = "Test Person", email = (string)null } },
            new[] { new { name = "Test Person", email = "" } }, new[] { new { name = "Test Person", email = " " } },
            new[] { new { name = "Test Person", email = "test" } },
            new[] { new { name = "Test Person", email = "test.com" } },
            new[] { new { name = "Test Person", email = "test@email.com" } }
        };
}
