using Eventuras.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json.Linq;
using System.Net;
using System.Threading.Tasks;
using Eventuras.TestAbstractions;
using Xunit;

namespace Eventuras.IntegrationTests.Pages.Admin.Events
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

            using var scope = this.factory.Services.NewScope();
            using var user = await scope.ServiceProvider.CreateUserAsync();

            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            using var eventInfo = await context.CreateEventAsync();
            using var product = await context.CreateProductAsync(eventInfo.Entity);
            using var variant = await context.CreateProductVariantAsync(product.Entity);
            using var registration = await context.CreateRegistrationAsync(eventInfo.Entity, user.Entity);
            using var order = await context.CreateOrderAsync(registration.Entity, new[] { product.Entity });

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
