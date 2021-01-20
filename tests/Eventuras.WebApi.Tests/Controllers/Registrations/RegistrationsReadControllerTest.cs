using Eventuras.TestAbstractions;
using System.Threading.Tasks;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Registrations
{
    public class RegistrationsReadControllerTest : IClassFixture<CustomWebApiApplicationFactory<Startup>>
    {
        private readonly CustomWebApiApplicationFactory<Startup> _factory;

        public RegistrationsReadControllerTest(CustomWebApiApplicationFactory<Startup> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task Should_Return_Unauthorized_For_Not_Logged_In_User()
        {
            var client = _factory.CreateClient();

            var response = await client.GetAsync("/v3/registrations");
            response.CheckUnauthorized();
        }

        [Fact]
        public async Task Should_Return_Empty_Registration_List()
        {
            var client = _factory.CreateClient()
                .SetAuthenticated();

            var response = await client.GetAsync("/v3/registrations");
            var paging = await response.AsTokenAsync();
            paging.CheckEmptyPaging();
        }

        [Fact]
        public async Task Should_Use_Paging_For_Registration_List()
        {
            // TODO: implement!
        }

        [Fact]
        public async Task Should_Limit_Registrations_For_Regular_User()
        {
            // TODO: implement!
        }

        [Fact]
        public async Task Should_Not_Limit_Registrations_For_Super_Admin()
        {
            // TODO: implement!
        }
    }
}
