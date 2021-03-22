using System;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Services;
using Eventuras.TestAbstractions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Users
{
    public class UsersControllerTests : IClassFixture<CustomWebApiApplicationFactory<Startup>>, IDisposable
    {
        private readonly CustomWebApiApplicationFactory<Startup> _factory;

        public UsersControllerTests(CustomWebApiApplicationFactory<Startup> factory)
        {
            _factory = factory;
            Cleanup();
        }

        private void Cleanup()
        {
            using var scope = _factory.Services.NewTestScope();
            scope.Db.Users.Clean();
            scope.Db.SaveChanges();
        }

        public void Dispose()
        {
            Cleanup();
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
        [InlineData(Roles.Admin)]
        [InlineData(Roles.SuperAdmin)]
        [InlineData(Roles.SystemAdmin)]
        public async Task List_Users_Should_Use_Paging(string role)
        {
            using var scope = _factory.Services.NewTestScope();

            var client = _factory.CreateClient()
                .Authenticated(role: role);

            using var user3 = await scope.CreateUserAsync(name: "Test Person 3");
            using var user2 = await scope.CreateUserAsync(name: "Test Person 2");
            using var user1 = await scope.CreateUserAsync(name: "Test Person 1");

            var response = await client.GetAsync("/v3/users?page=1&count=2");
            response.CheckOk();

            var json = await response.AsTokenAsync();
            json.CheckPaging(1, 2, 3,
                (token, u) => token.CheckUser(u),
                user1.Entity, user2.Entity);

            response = await client.GetAsync("/v3/users?page=2&count=2");
            response.CheckOk();

            json = await response.AsTokenAsync();
            json.CheckPaging(2, 2, 3,
                (token, u) => token.CheckUser(u),
                user3.Entity);
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

            var response = await client.PostAsync("/v3/users", new
            {
                name = "Test Person",
                email = "test@email.com"
            });

            response.CheckConflict();
        }

        [Fact]
        public async Task Create_New_User_Should_Not_Return_Conflict_If_Existing_Email_Is_Archived()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync(email: "test@email.com", archived: true);

            var client = _factory.CreateClient()
                .AuthenticatedAsSuperAdmin();

            var response = await client.PostAsync("/v3/users", new
            {
                name = "Test Person",
                email = "test@email.com"
            });

            response.CheckOk();

            var newUser = await scope.Db.Users.SingleAsync(u => u.Email == "test@email.com" && !u.Archived);
            Assert.NotEqual(newUser.Id, user.Entity.Id);

            var json = await response.AsTokenAsync();
            json.CheckUser(newUser);
        }

        [Theory]
        [MemberData(nameof(GetInvalidUserInput))]
        public async Task Create_New_User_Should_Validate_Input(object input)
        {
            var client = _factory.CreateClient()
                .AuthenticatedAsSuperAdmin();

            var response = await client.PostAsync("/v3/users", input);
            response.CheckBadRequest();
        }

        [Fact]
        public async Task Should_Create_New_User()
        {
            var client = _factory.CreateClient()
                .AuthenticatedAsSuperAdmin();

            var response = await client.PostAsync("/v3/users", new
            {
                name = "John Doe",
                email = "test@email.com"
            });

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

            var response = await client.PostAsync("/v3/users", new
            {
                name = "John Doe",
                email = "test@email.com",
                phoneNumber = "+11111111111"
            });

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

            var response = await client.PostAsync("/v3/users", new
            {
                name = "John Doe",
                email = "test@email.com"
            });

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

            var response = await client.PutAsync($"/v3/users/{user.Entity.Id}", new
            {
                name = user.Entity.Name,
                email = otherUser.Entity.Email
            });

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

            var response = await client.PutAsync($"/v3/users/{user.Entity.Id}", new
            {
                name = user.Entity.Name,
                email = otherUser.Entity.Email
            });

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

        [Theory]
        [MemberData(nameof(GetInvalidUserInput))]
        public async Task Update_User_Should_Validate_Input(object input)
        {
            var client = _factory.CreateClient()
                .AuthenticatedAsSuperAdmin();

            var response = await client.PutAsync($"/v3/users/{Guid.NewGuid()}", input);
            response.CheckBadRequest();
        }

        [Fact]
        public async Task Should_Update_User_With_Max_Data()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync(phone: null);

            var client = _factory.CreateClient()
                .AuthenticatedAsSuperAdmin();

            var response = await client.PutAsync($"/v3/users/{user.Entity.Id}", new
            {
                name = "John Doe",
                email = "another@email.com",
                phoneNumber = "+1234567890"
            });

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

            var response = await client.PutAsync($"/v3/users/{user.Entity.Id}", new
            {
                name = "John Doe",
                email = "another@email.com"
            });

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

        public static object[][] GetInvalidUserInput()
        {
            return new object[][]
            {
                new [] { new {name = (string)null, email = "test@email.com"} },
                new [] { new {name = "", email = "test@email.com"} },
                new [] { new {name = " ", email = "test@email.com"} },
                new [] { new {name = "Test Person", email = (string)null} },
                new [] { new {name = "Test Person", email = ""} },
                new [] { new {name = "Test Person", email = " "} },
                new [] { new {name = "Test Person", email = "test"} },
                new [] { new {name = "Test Person", email = "test.com"} },
                new [] { new {name = "Test Person", email = "test@email.com", phoneNumber = "wrong"} }
            };
        }
    }
}