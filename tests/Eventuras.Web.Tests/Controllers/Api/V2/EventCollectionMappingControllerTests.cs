using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Eventuras.IntegrationTests;
using Eventuras.Services;
using Eventuras.TestAbstractions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Eventuras.Web.Tests.Controllers.Api.V2
{
    public class EventCollectionMappingControllerTests : IClassFixture<CustomWebApplicationFactory<Startup>>
    {
        private readonly CustomWebApplicationFactory<Startup> _factory;

        public EventCollectionMappingControllerTests(CustomWebApplicationFactory<Startup> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task Create_Should_Return_Not_Found_For_Unknown_Event()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewTestScope();
            using var collection = await scope.CreateEventCollectionAsync();
            var response = await client.PutAsync($"/api/v2/events/10001/collections/{collection.Entity.CollectionId}",
                new StringContent("", Encoding.UTF8));

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task Create_Should_Return_Not_Found_For_Unknown_Collection()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewTestScope();
            using var @event = await scope.CreateEventAsync();
            var response = await client.PutAsync($"/api/v2/events/{@event.Entity.EventInfoId}/collections/10001",
                new StringContent("", Encoding.UTF8));

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task Should_Not_Allow_To_Map_Not_Accessible_Event()
        {
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewTestScope();
            using var org = await scope.CreateOrganizationAsync(hostname: "localhost");
            using var otherOrg = await scope.CreateOrganizationAsync();
            using var collection = await scope.CreateEventCollectionAsync(organization: org.Entity);
            using var @event = await scope.CreateEventAsync(organization: otherOrg.Entity);

            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            await client.LoginAsync(admin.Entity.Email, TestingConstants.DefaultPassword);

            var response = await client.PutAsync($"/api/v2/events/{@event.Entity.EventInfoId}/collections/{collection.Entity.CollectionId}",
                new StringContent("", Encoding.UTF8));

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode); // FIXME: 403 Forbidden redirects to Login page
        }

        [Fact]
        public async Task Should_Not_Allow_To_Map_To_Not_Accessible_Collection()
        {
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewTestScope();
            using var org = await scope.CreateOrganizationAsync(hostname: "localhost");
            using var otherOrg = await scope.CreateOrganizationAsync();
            using var collection = await scope.CreateEventCollectionAsync(organization: otherOrg.Entity);
            using var @event = await scope.CreateEventAsync(organization: org.Entity);

            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            await client.LoginAsync(admin.Entity.Email, TestingConstants.DefaultPassword);

            var response = await client.PutAsync($"/api/v2/events/{@event.Entity.EventInfoId}/collections/{collection.Entity.CollectionId}",
                new StringContent("", Encoding.UTF8));

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode); // FIXME: 403 Forbidden redirects to Login page
        }

        [Fact]
        public async Task Should_Create_Mapping()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewTestScope();
            using var collection = await scope.CreateEventCollectionAsync();
            using var @event = await scope.CreateEventAsync();

            var response = await client.PutAsync($"/api/v2/events/{@event.Entity.EventInfoId}/collections/{collection.Entity.CollectionId}",
                new StringContent("", Encoding.UTF8));

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(await scope.Db.EventCollectionMappings
                .SingleOrDefaultAsync(m => m.EventId == @event.Entity.EventInfoId
                                  && m.CollectionId == collection.Entity.CollectionId));
        }

        [Fact]
        public async Task Should_Return_Ok_When_Mapping_Second_Time()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewTestScope();
            using var collection = await scope.CreateEventCollectionAsync();
            using var @event = await scope.CreateEventAsync(collection: collection.Entity);

            var response = await client.PutAsync($"/api/v2/events/{@event.Entity.EventInfoId}/collections/{collection.Entity.CollectionId}",
                new StringContent("", Encoding.UTF8));

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(await scope.Db.EventCollectionMappings
                .SingleOrDefaultAsync(m => m.EventId == @event.Entity.EventInfoId
                                           && m.CollectionId == collection.Entity.CollectionId));
        }

        [Fact]
        public async Task Should_Allow_To_Map_Event_To_Collection_From_Other_Org()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewTestScope();
            using var org1 = await scope.CreateOrganizationAsync();
            using var org2 = await scope.CreateOrganizationAsync();
            using var collection = await scope.CreateEventCollectionAsync(organization: org1.Entity);
            using var @event = await scope.CreateEventAsync(organization: org2.Entity);

            var response = await client.PutAsync($"/api/v2/events/{@event.Entity.EventInfoId}/collections/{collection.Entity.CollectionId}",
                new StringContent("", Encoding.UTF8));

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(await scope.Db.EventCollectionMappings
                .SingleOrDefaultAsync(m => m.EventId == @event.Entity.EventInfoId
                                           && m.CollectionId == collection.Entity.CollectionId));
        }

        [Fact]
        public async Task Should_Return_Not_Found_When_Removing_Mapping_For_Unknown_Event()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewTestScope();
            using var collection = await scope.CreateEventCollectionAsync();
            var response = await client.DeleteAsync($"/api/v2/events/10001/collections/{collection.Entity.CollectionId}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task Should_Return_Not_Found_When_Removing_Mapping_For_Unknown_Collection()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewTestScope();
            using var @event = await scope.CreateEventAsync();
            var response = await client.DeleteAsync($"/api/v2/events/{@event.Entity.EventInfoId}/collections/10001");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task Should_Return_Ok_When_Removing_Non_Existing_Mapping()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewTestScope();
            using var collection = await scope.CreateEventCollectionAsync();
            using var @event = await scope.CreateEventAsync();

            var response = await client.DeleteAsync($"/api/v2/events/{@event.Entity.EventInfoId}/collections/{collection.Entity.CollectionId}");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task Should_Remove_Mapping()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewTestScope();
            using var collection = await scope.CreateEventCollectionAsync();
            var @event = await scope.CreateEventAsync(collection: collection.Entity);

            var response = await client.DeleteAsync($"/api/v2/events/{@event.Entity.EventInfoId}/collections/{collection.Entity.CollectionId}");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.False(await scope.Db.EventCollectionMappings.AnyAsync());
            Assert.True(await scope.Db.EventInfos.AnyAsync(e => e.EventInfoId == @event.Entity.EventInfoId));
            Assert.True(await scope.Db.EventCollections.AnyAsync(e => e.CollectionId == collection.Entity.CollectionId));
        }

        [Fact(Skip = "Rework the orgaccessor.")]
        public async Task Should_Not_Allow_To_Remove_Mapping_For_Not_Accessible_Event()
        {
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewTestScope();
            using var org = await scope.CreateOrganizationAsync(hostname: "localhost");
            using var otherOrg = await scope.CreateOrganizationAsync();
            using var collection = await scope.CreateEventCollectionAsync(organization: org.Entity);
            using var @event = await scope.CreateEventAsync(organization: otherOrg.Entity);

            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            await client.LoginAsync(admin.Entity.Email, TestingConstants.DefaultPassword);

            var response = await client.DeleteAsync($"/api/v2/events/{@event.Entity.EventInfoId}/collections/{collection.Entity.CollectionId}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode); // FIXME: 403 Forbidden redirects to Login page
        }

        [Fact]
        public async Task Should_Not_Allow_To_Remove_Mapping_For_Not_Accessible_Collection()
        {
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewTestScope();
            using var org = await scope.CreateOrganizationAsync(hostname: "localhost");
            using var otherOrg = await scope.CreateOrganizationAsync();
            using var collection = await scope.CreateEventCollectionAsync(organization: otherOrg.Entity);
            using var @event = await scope.CreateEventAsync(organization: org.Entity);

            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            await client.LoginAsync(admin.Entity.Email, TestingConstants.DefaultPassword);

            var response = await client.DeleteAsync($"/api/v2/events/{@event.Entity.EventInfoId}/collections/{collection.Entity.CollectionId}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode); // FIXME: 403 Forbidden redirects to Login page
        }
    }
}
