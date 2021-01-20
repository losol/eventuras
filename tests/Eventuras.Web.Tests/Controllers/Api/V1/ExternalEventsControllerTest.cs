using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Eventuras.IntegrationTests;
using Eventuras.TestAbstractions;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using Xunit;

namespace Eventuras.Web.Tests.Controllers.Api.V1
{
    public class ExternalEventsControllerTest : IClassFixture<CustomWebApplicationFactory<Startup>>
    {
        private readonly CustomWebApplicationFactory<Startup> _factory;

        public ExternalEventsControllerTest(CustomWebApplicationFactory<Startup> factory)
        {
            _factory = factory;
        }

        // TODO: check auth (after switching to JWT)

        [Fact]
        public async Task List_Should_Return_Not_Found_For_Non_Existing_Event()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            var response = await client.GetAsync("/api/v1/events/external/0");
            response.CheckNotFound();
        }

        [Fact]
        public async Task Should_Return_Empty_Events_List()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewTestScope();
            using var eventInfo = await scope.CreateEventAsync();

            var response = await client.GetAsync($"/api/v1/events/external/{eventInfo.Entity.EventInfoId}");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            JArray.Parse(content).CheckEmptyArray();
        }

        [Fact]
        public async Task Should_Return_External_Event_List_For_Event()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewTestScope();

            using var eventInfo = await scope.CreateEventAsync();
            using var externalEvent = await scope.CreateExternalEventAsync(eventInfo.Entity);
            using var externalEvent2 = await scope.CreateExternalEventAsync(eventInfo.Entity);

            using var eventInfo2 = await scope.CreateEventAsync();
            using var anotherEventEvent = await scope.CreateExternalEventAsync(eventInfo2.Entity);


            var response = await client.GetAsync($"/api/v1/events/external/{eventInfo.Entity.EventInfoId}");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            JArray.Parse(content).CheckArray((token, externalEvent) => token.CheckExternalEvent(externalEvent),
                externalEvent.Entity, externalEvent2.Entity);
        }

        [Fact]
        public async Task Delete_Should_Return_Not_Found_For_Non_Existing_Event()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            var response = await client.DeleteAsync("/api/v1/events/external/0?localId=1");
            response.CheckNotFound();
        }

        [Fact]
        public async Task Delete_Should_Require_LocalId_Param()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewTestScope();
            using var eventInfo = await scope.CreateEventAsync();

            var response = await client.DeleteAsync($"/api/v1/events/external/{eventInfo.Entity.EventInfoId:####}");
            await response.CheckBadRequestAsync();
        }

        [Fact]
        public async Task Delete_Should_Return_Ok_For_Non_Existing_External_Event()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewTestScope();
            
            using var eventInfo = await scope.CreateEventAsync();

            var response = await client.DeleteAsync($"/api/v1/events/external/{eventInfo.Entity.EventInfoId:####}?localId=1");
            response.CheckOk();
        }

        [Fact]
        public async Task Delete_Should_Return_Not_Found_For_Wrong_Local_Id()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewTestScope();
            
            using var eventInfo = await scope.CreateEventAsync();
            using var anotherEvent = await scope.CreateEventAsync();
            using var anotherExternalEvent = await scope.CreateExternalEventAsync(anotherEvent.Entity);

            var response = await client.DeleteAsync($"/api/v1/events/external/{eventInfo.Entity.EventInfoId:####}?localId={anotherExternalEvent.Entity.LocalId}");
            response.CheckNotFound();
        }

        [Fact]
        public async Task Should_Delete_External_Event()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewTestScope();
            
            using var eventInfo = await scope.CreateEventAsync();
            var externalEvent = await scope.CreateExternalEventAsync(eventInfo.Entity); // will be deleted in controller

            var response = await client.DeleteAsync($"/api/v1/events/external/{eventInfo.Entity.EventInfoId:####}?localId={externalEvent.Entity.LocalId}");
            response.CheckOk();

            scope.Db.Entry(eventInfo.Entity.ExternalEvents.First()).State = EntityState.Detached;
            Assert.Null(await scope.Db.ExternalEvents.AsNoTracking()
                .FirstOrDefaultAsync(c => c.LocalId == externalEvent.Entity.LocalId));
        }
    }
}
