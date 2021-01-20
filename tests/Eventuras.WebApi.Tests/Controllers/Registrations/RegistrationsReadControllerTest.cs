using System;
using Eventuras.TestAbstractions;
using System.Threading.Tasks;
using Eventuras.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Registrations
{
    public class RegistrationsReadControllerTest : IClassFixture<CustomWebApiApplicationFactory<Startup>>, IDisposable
    {
        private readonly CustomWebApiApplicationFactory<Startup> _factory;
        private readonly IServiceScope _scope;

        private ApplicationDbContext Context => _scope.ServiceProvider
            .GetRequiredService<ApplicationDbContext>();

        public RegistrationsReadControllerTest(CustomWebApiApplicationFactory<Startup> factory)
        {
            _factory = factory;
            _scope = factory.Services.NewTestScope();
        }

        public void Dispose()
        {
            _scope.Dispose();
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
            var client = _factory.CreateClient()
                .SetAuthenticatedAsSystemAdmin();

            using var scope = _factory.Services.NewTestScope();


            // TODO: implement!
        }

        [Fact]
        public async Task Should_Limit_Registrations_For_Regular_User()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = scope.CreateUserAsync();
        }

        [Fact]
        public async Task Should_Not_Limit_Registrations_For_Super_Admin()
        {
            // TODO: implement!
        }
    }
}
