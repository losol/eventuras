using System;
using Eventuras.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json.Linq;
using System.Net;
using System.Threading.Tasks;
using Eventuras.TestAbstractions;
using Xunit;

namespace Eventuras.IntegrationTests.Controllers.Api.V2
{
    public class EventInfoControllerTest : IClassFixture<CustomWebApplicationFactory<Startup>>
    {
        private readonly CustomWebApplicationFactory<Startup> _factory;

        public EventInfoControllerTest(CustomWebApplicationFactory<Startup> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task Should_Return_Empty_Event_List()
        {
            var client = _factory.CreateClient();

            var response = await client.GetAsync("/api/v2/events");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            JArray.Parse(content).CheckEmptyArray();
        }

        [Fact]
        public async Task Should_List_Upcoming_Events()
        {
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            using var pastEvent = await context.CreateEventAsync(dateStart: DateTime.Now.AddHours(-1));
            using var e1 = await context.CreateEventAsync(dateStart: DateTime.Now.AddHours(1));
            using var e2 = await context.CreateEventAsync(dateStart: DateTime.Now.AddHours(2));

            var response = await client.GetAsync("/api/v2/events");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            JArray.Parse(content).CheckArray((token, e) => token.CheckEvent(e),
                e1.Entity, e2.Entity);
        }

        [Fact]
        public async Task List_Events_Should_Support_Collection_Query_Param()
        {
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            using var collection = await context.CreateEventCollectionAsync();
            using var otherCollection = await context.CreateEventCollectionAsync();
            using var noCollectionEvent = await context.CreateEventAsync(dateStart: DateTime.Now.AddHours(1));
            using var e1 = await context.CreateEventAsync(collection: collection.Entity, dateStart: DateTime.Now.AddHours(1));
            using var e2 = await context.CreateEventAsync(collections: new[]
            {
                collection.Entity,
                otherCollection.Entity
            }, dateStart: DateTime.Now.AddHours(2));

            var response = await client.GetAsync($"/api/v2/events?collection={collection.Entity.CollectionId}");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            JArray.Parse(content).CheckArray((token, e) => token.CheckEvent(e),
                e1.Entity, e2.Entity);

            response = await client.GetAsync($"/api/v2/events?collection={otherCollection.Entity.CollectionId}");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            content = await response.Content.ReadAsStringAsync();
            JArray.Parse(content).CheckArray((token, e) => token.CheckEvent(e),
                e2.Entity);
        }
    }
}
