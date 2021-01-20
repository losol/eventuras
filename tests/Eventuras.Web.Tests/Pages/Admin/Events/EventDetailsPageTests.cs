using System.Net;
using System.Threading.Tasks;
using Eventuras.IntegrationTests;
using Eventuras.TestAbstractions;
using Newtonsoft.Json.Linq;
using Xunit;

namespace Eventuras.Web.Tests.Pages.Admin.Events
{
    public class EventDetailsPageTests : IClassFixture<CustomWebApplicationFactory<Startup>>
    {
        private readonly CustomWebApplicationFactory<Startup> factory;

        public EventDetailsPageTests(CustomWebApplicationFactory<Startup> factory)
        {
            this.factory = factory;
        }

        [Fact]
        public async Task Should_Return_Participants_And_Products()
        {
            var client = this.factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = this.factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();

            
            using var eventInfo = await scope.CreateEventAsync();
            using var product = await scope.CreateProductAsync(eventInfo.Entity);
            using var variant = await scope.CreateProductVariantAsync(product.Entity);
            using var registration = await scope.CreateRegistrationAsync(eventInfo.Entity, user.Entity);
            using var order = await scope.CreateOrderAsync(registration.Entity, new[] { product.Entity });

            var response = await client.GetAsync($"/Admin/Events/Details/{eventInfo.Entity.EventInfoId}?handler=Participants");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            Assert.NotEqual("none", content);
            JArray.Parse(content).CheckArray(
                (token, r) => token.CheckRegistration(r),
                registration.Entity);
        }
    }
}
