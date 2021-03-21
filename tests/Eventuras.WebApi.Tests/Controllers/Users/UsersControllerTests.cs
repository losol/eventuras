using System.Threading.Tasks;
using Eventuras.Services;
using Eventuras.TestAbstractions;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Users
{
    public class UsersControllerTests : IClassFixture<CustomWebApiApplicationFactory<Startup>>
    {
        private readonly CustomWebApiApplicationFactory<Startup> _factory;

        public UsersControllerTests(CustomWebApiApplicationFactory<Startup> factory)
        {
            _factory = factory;
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

        [Fact]
        public async Task List_Users_Should_Use_Paging()
        {
            using var scope = _factory.Services.NewTestScope();

            var client = _factory.CreateClient()
                .Authenticated(role: Roles.SuperAdmin);

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
        public async Task List_Users_Should_Restrict_Visibility_For_Org_Admin()
        {
            using var scope = _factory.Services.NewTestScope();
            using var org = await scope.CreateOrganizationAsync(hostname: "localhost");
            using var admin = await scope.CreateUserAsync(name: "Test Admin", role: Roles.Admin, organization: org.Entity);

            var client = _factory.CreateClient()
                .AuthenticatedAs(admin.Entity, Roles.Admin);

            using var user1 = await scope.CreateUserAsync(name: "Test User 1", organization: org.Entity);
            using var user2 = await scope.CreateUserAsync(name: "Test User 2", organization: org.Entity);
            using var user3 = await scope.CreateUserAsync(name: "Test User 3");

            var response = await client.GetAsync("/v3/users");
            response.CheckOk();

            var json = await response.AsTokenAsync();
            json.CheckPaging(1, 3,
                (token, u) => token.CheckUser(u),
                admin.Entity, user1.Entity, user2.Entity);
        }
    }
}
