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
    }
}
