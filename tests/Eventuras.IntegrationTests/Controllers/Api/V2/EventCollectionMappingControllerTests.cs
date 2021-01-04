using Eventuras.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Eventuras.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Eventuras.IntegrationTests.Controllers.Api.V2
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

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            using var collection = await context.CreateEventCollectionAsync();
            var response = await client.PutAsync($"/api/v2/events/10001/collections/{collection.Entity.CollectionId}",
                new StringContent("", Encoding.UTF8));

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task Create_Should_Return_Not_Found_For_Unknown_Collection()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            using var @event = await context.CreateEventAsync();
            var response = await client.PutAsync($"/api/v2/events/{@event.Entity.EventInfoId}/collections/10001",
                new StringContent("", Encoding.UTF8));

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task Should_Not_Allow_To_Map_Not_Accessible_Event()
        {
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            using var org = await context.CreateOrganizationAsync(hostname: "localhost");
            using var otherOrg = await context.CreateOrganizationAsync();
            using var collection = await context.CreateEventCollectionAsync(organization: org.Entity);
            using var @event = await context.CreateEventAsync(organization: otherOrg.Entity);

            using var admin = await scope.ServiceProvider.CreateUserAsync(role: Roles.Admin);
            using var member = await context.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            await client.LoginAsync(admin.Entity.Email, ServiceProviderExtensions.DefaultPassword);

            var response = await client.PutAsync($"/api/v2/events/{@event.Entity.EventInfoId}/collections/{collection.Entity.CollectionId}",
                new StringContent("", Encoding.UTF8));

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode); // FIXME: 403 Forbidden redirects to Login page
        }

        [Fact]
        public async Task Should_Not_Allow_To_Map_To_Not_Accessible_Collection()
        {
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            using var org = await context.CreateOrganizationAsync(hostname: "localhost");
            using var otherOrg = await context.CreateOrganizationAsync();
            using var collection = await context.CreateEventCollectionAsync(organization: otherOrg.Entity);
            using var @event = await context.CreateEventAsync(organization: org.Entity);

            using var admin = await scope.ServiceProvider.CreateUserAsync(role: Roles.Admin);
            using var member = await context.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            await client.LoginAsync(admin.Entity.Email, ServiceProviderExtensions.DefaultPassword);

            var response = await client.PutAsync($"/api/v2/events/{@event.Entity.EventInfoId}/collections/{collection.Entity.CollectionId}",
                new StringContent("", Encoding.UTF8));

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode); // FIXME: 403 Forbidden redirects to Login page
        }

        [Fact]
        public async Task Should_Create_Mapping()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            using var collection = await context.CreateEventCollectionAsync();
            using var @event = await context.CreateEventAsync();

            var response = await client.PutAsync($"/api/v2/events/{@event.Entity.EventInfoId}/collections/{collection.Entity.CollectionId}",
                new StringContent("", Encoding.UTF8));

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(await context.EventCollectionMappings
                .SingleOrDefaultAsync(m => m.EventId == @event.Entity.EventInfoId
                                  && m.CollectionId == collection.Entity.CollectionId));
        }

        [Fact]
        public async Task Should_Return_Ok_When_Mapping_Second_Time()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            using var collection = await context.CreateEventCollectionAsync();
            using var @event = await context.CreateEventAsync(collection: collection.Entity);

            var response = await client.PutAsync($"/api/v2/events/{@event.Entity.EventInfoId}/collections/{collection.Entity.CollectionId}",
                new StringContent("", Encoding.UTF8));

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(await context.EventCollectionMappings
                .SingleOrDefaultAsync(m => m.EventId == @event.Entity.EventInfoId
                                           && m.CollectionId == collection.Entity.CollectionId));
        }

        [Fact]
        public async Task Should_Allow_To_Map_Event_To_Collection_From_Other_Org()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            using var org1 = await context.CreateOrganizationAsync();
            using var org2 = await context.CreateOrganizationAsync();
            using var collection = await context.CreateEventCollectionAsync(organization: org1.Entity);
            using var @event = await context.CreateEventAsync(organization: org2.Entity);

            var response = await client.PutAsync($"/api/v2/events/{@event.Entity.EventInfoId}/collections/{collection.Entity.CollectionId}",
                new StringContent("", Encoding.UTF8));

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(await context.EventCollectionMappings
                .SingleOrDefaultAsync(m => m.EventId == @event.Entity.EventInfoId
                                           && m.CollectionId == collection.Entity.CollectionId));
        }

        [Fact]
        public async Task Should_Return_Not_Found_When_Removing_Mapping_For_Unknown_Event()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            using var collection = await context.CreateEventCollectionAsync();
            var response = await client.DeleteAsync($"/api/v2/events/10001/collections/{collection.Entity.CollectionId}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task Should_Return_Not_Found_When_Removing_Mapping_For_Unknown_Collection()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            using var @event = await context.CreateEventAsync();
            var response = await client.DeleteAsync($"/api/v2/events/{@event.Entity.EventInfoId}/collections/10001");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task Should_Return_Ok_When_Removing_Non_Existing_Mapping()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            using var collection = await context.CreateEventCollectionAsync();
            using var @event = await context.CreateEventAsync();

            var response = await client.DeleteAsync($"/api/v2/events/{@event.Entity.EventInfoId}/collections/{collection.Entity.CollectionId}");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task Should_Remove_Mapping()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // FIXME: not removing them automatically by using "using" keyword
            // because they both refer to the mapping entity deleted in API method.
            // Possible solution??
            var collection = await context.CreateEventCollectionAsync();
            var @event = await context.CreateEventAsync(collection: collection.Entity);

            var response = await client.DeleteAsync($"/api/v2/events/{@event.Entity.EventInfoId}/collections/{collection.Entity.CollectionId}");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.False(await context.EventCollectionMappings.AnyAsync());
            Assert.True(await context.EventInfos.AnyAsync(e => e.EventInfoId == @event.Entity.EventInfoId));
            Assert.True(await context.EventCollections.AnyAsync(e => e.CollectionId == collection.Entity.CollectionId));
        }

        [Fact]
        public async Task Should_Not_Allow_To_Remove_Mapping_For_Not_Accessible_Event()
        {
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            using var org = await context.CreateOrganizationAsync(hostname: "localhost");
            using var otherOrg = await context.CreateOrganizationAsync();
            using var collection = await context.CreateEventCollectionAsync(organization: org.Entity);
            using var @event = await context.CreateEventAsync(organization: otherOrg.Entity);

            using var admin = await scope.ServiceProvider.CreateUserAsync(role: Roles.Admin);
            using var member = await context.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            await client.LoginAsync(admin.Entity.Email, ServiceProviderExtensions.DefaultPassword);

            var response = await client.DeleteAsync($"/api/v2/events/{@event.Entity.EventInfoId}/collections/{collection.Entity.CollectionId}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode); // FIXME: 403 Forbidden redirects to Login page
        }

        [Fact]
        public async Task Should_Not_Allow_To_Remove_Mapping_For_Not_Accessible_Collection()
        {
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            using var org = await context.CreateOrganizationAsync(hostname: "localhost");
            using var otherOrg = await context.CreateOrganizationAsync();
            using var collection = await context.CreateEventCollectionAsync(organization: otherOrg.Entity);
            using var @event = await context.CreateEventAsync(organization: org.Entity);

            using var admin = await scope.ServiceProvider.CreateUserAsync(role: Roles.Admin);
            using var member = await context.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            await client.LoginAsync(admin.Entity.Email, ServiceProviderExtensions.DefaultPassword);

            var response = await client.DeleteAsync($"/api/v2/events/{@event.Entity.EventInfoId}/collections/{collection.Entity.CollectionId}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode); // FIXME: 403 Forbidden redirects to Login page
        }
    }
}
