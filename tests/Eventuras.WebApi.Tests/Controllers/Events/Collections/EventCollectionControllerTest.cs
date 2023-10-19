using Eventuras.Domain;
using Eventuras.Services;
using Eventuras.TestAbstractions;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Events.Collections
{
    public class EventCollectionControllerTest : IClassFixture<CustomWebApiApplicationFactory<Startup>>, IDisposable
    {
        private readonly CustomWebApiApplicationFactory<Startup> _factory;

        public EventCollectionControllerTest(CustomWebApiApplicationFactory<Startup> factory)
        {
            _factory = factory ?? throw new ArgumentNullException(nameof(factory));

            Cleanup();
        }

        public void Dispose()
        {
            Cleanup();
        }

        private void Cleanup()
        {
            using var scope = _factory.Services.NewTestScope();
            scope.Db.EventCollections.RemoveRange(scope.Db.EventCollections.ToArray());
            scope.Db.Organizations.RemoveRange(scope.Db.Organizations.ToArray());
            scope.Db.SaveChanges();
        }

        [Fact]
        public async Task Should_Return_Empty_List()
        {
            var client = _factory.CreateClient();

            var response = await client.GetAsync("/v3/events/collections");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            JArray.Parse(content).CheckEmptyArray();
        }

        [Fact]
        public async Task Should_Return_Collection_List_Sorted_By_Name()
        {
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewTestScope();
            using var c2 = await scope.CreateEventCollectionAsync("Collection 2");
            using var c1 = await scope.CreateEventCollectionAsync("Collection 1");

            var response = await client.GetAsync("/v3/events/collections");
            var content = await response.CheckOk().AsArrayAsync();
            content.CheckArray((token, c) => token.CheckEventCollection(c),
                c1.Entity, c2.Entity);
        }

        [Fact]
        public async Task Should_Not_Return_Collections_From_Other_Organization()
        {
            using var scope = _factory.Services.NewTestScope();
            using var org1 = await scope.CreateOrganizationAsync(hostname: "localhost");
            using var org2 = await scope.CreateOrganizationAsync(hostname: "another");

            using var c1 = await scope.CreateEventCollectionAsync("Collection 1", organization: org1.Entity);
            using var c2 = await scope.CreateEventCollectionAsync("Collection 2", organization: org2.Entity);

            using var adminOfOrg1 = await scope.CreateUserAsync(role: Roles.Admin);
            using var member1 =
                await scope.CreateOrganizationMemberAsync(adminOfOrg1.Entity, org1.Entity, role: Roles.Admin);

            var client = _factory.CreateClient()
                .AuthenticatedAs(adminOfOrg1.Entity, Roles.Admin);

            var response = await client.GetAsync("/v3/events/collections");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            JArray.Parse(content).CheckArray((token, c) => token.CheckEventCollection(c), c1.Entity);
        }

        [Fact]
        public async Task Should_Return_All_Collections_If_No_Current_Org()
        {
            using var scope = _factory.Services.NewTestScope();

            using var org1 = await scope.CreateOrganizationAsync(hostname: "some"); // not localhost
            using var org2 = await scope.CreateOrganizationAsync(hostname: "another"); // not localhost, too

            using var c1 = await scope.CreateEventCollectionAsync("Collection 1", organization: org1.Entity);
            using var c2 = await scope.CreateEventCollectionAsync("Collection 2", organization: org2.Entity);

            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, org1.Entity, role: Roles.Admin);

            var client = _factory.CreateClient()
                .AuthenticatedAs(admin.Entity, Roles.Admin);

            var response = await client.GetAsync("/v3/events/collections");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            JArray.Parse(content).CheckArray((token, c) => token.CheckEventCollection(c), c1.Entity, c2.Entity);
        }

        [Fact]
        public async Task Should_Return_Not_Found_For_Unknown_Collection_Id()
        {
            var client = _factory.CreateClient();
            var response = await client.GetAsync("/v3/events/collections/2020");
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task Should_Return_Collection_Info()
        {
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewTestScope();
            using var collection = await scope.CreateEventCollectionAsync();

            var response = await client.GetAsync($"/v3/events/collections/{collection.Entity.CollectionId}");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            JObject.Parse(content).CheckEventCollection(collection.Entity);
        }

        [Fact]
        public async Task Should_Not_Allow_To_Create_New_Collection_To_Non_Admin()
        {
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewTestScope();
            using var org = await scope.CreateOrganizationAsync(hostname: "some"); // not localhost

            await client.PostAsync("/v3/events/collections", new StringContent(JsonConvert.SerializeObject(new
            {
                name = "Test",
                organizationId = org.Entity.OrganizationId
            }), Encoding.UTF8, "application/json"));

            // FIXME: Not checking status here, it's OK since the app redirects to login screen!

            Assert.False(await scope.Db.EventCollections.AnyAsync());
        }

        [Fact]
        public async Task Should_Not_Allow_To_Create_New_Collection_For_Non_Current_Org()
        {
            using var scope = _factory.Services.NewTestScope();
            using var org = await scope.CreateOrganizationAsync(hostname: "some"); // not localhost
            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);

            var client = _factory.CreateClient()
                .AuthenticatedAs(admin.Entity, Roles.Admin);

            var json = JsonConvert.SerializeObject(new
            {
                name = "Test",
                organizationId = org.Entity.OrganizationId
            });

            await client.PostAsync("/v3/events/collections",
                new StringContent(json, Encoding.UTF8, "application/json"));

            // FIXME: Not checking status here, it's OK since the app redirects to login screen!

            Assert.False(await scope.Db.EventCollections.AnyAsync());
        }

        [Fact]
        public async Task Should_Allow_To_Create_New_Collection_To_Admin_Of_The_Current_Org()
        {
            using var scope = _factory.Services.NewTestScope();
            using var org = await scope.CreateOrganizationAsync(hostname: "localhost");
            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);

            var client = _factory.CreateClient()
                .AuthenticatedAs(admin.Entity, Roles.Admin);

            Assert.False(await scope.Db.EventCollections.AnyAsync());

            var response = await client.PostAsync("/v3/events/collections", new
            {
                name = "Test",
                organizationId = org.Entity.OrganizationId
            });

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var collection = await scope.Db.EventCollections.AsNoTracking().SingleOrDefaultAsync();
            Assert.NotNull(collection);
            Assert.Equal("Test", collection.Name);

            var token = await response.AsTokenAsync();
            token.CheckEventCollection(collection);
        }

        [Theory]
        [InlineData(Roles.SuperAdmin)]
        [InlineData(Roles.SystemAdmin)]
        public async Task Should_Allow_To_Create_New_Collection_To_Power_Admin(string role)
        {
            var client = _factory.CreateClient()
                .Authenticated(role: role);

            using var scope = _factory.Services.NewTestScope();
            Assert.False(await scope.Db.EventCollections.AnyAsync());

            using var org = await scope.CreateOrganizationAsync();
            var response = await client.PostAsync("/v3/events/collections", new StringContent(
                JsonConvert.SerializeObject(new
                {
                    name = "Test",
                    organizationId = org.Entity.OrganizationId
                }), Encoding.UTF8, "application/json"));

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var collection = await scope.Db.EventCollections.AsNoTracking().SingleOrDefaultAsync();
            Assert.NotNull(collection);
            Assert.Equal("Test", collection.Name);

            var token = await response.AsTokenAsync();
            token.CheckEventCollection(collection);
        }

        [Fact]
        public async Task Should_Save_All_Posted_Data()
        {
            var client = _factory.CreateClient()
                .AuthenticatedAsSystemAdmin();

            using var scope = _factory.Services.NewTestScope();


            Assert.False(await scope.Db.EventCollections.AnyAsync());

            using var org = await scope.CreateOrganizationAsync();
            var response = await client.PostAsync("/v3/events/collections", new StringContent(
                JsonConvert.SerializeObject(new
                {
                    name = "Test",
                    organizationId = org.Entity.OrganizationId,
                    slug = "Test slug",
                    description = "Test Description",
                    featured = true,
                    featuredImageUrl = "test://",
                    featuredImageCaption = "Test Caption",
                }), Encoding.UTF8, "application/json"));

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var collection = await scope.Db.EventCollections.AsNoTracking().SingleOrDefaultAsync();
            Assert.NotNull(collection);
            Assert.Equal("Test", collection.Name);
            Assert.Equal(org.Entity.OrganizationId, collection.OrganizationId);
            Assert.Equal("Test slug", collection.Slug);
            Assert.Equal("Test Description", collection.Description);
            Assert.True(collection.Featured);
            Assert.Equal("test://", collection.FeaturedImageUrl);
            Assert.Equal("Test Caption", collection.FeaturedImageCaption);
        }

        [Fact]
        public async Task Should_Require_New_Collection_Name()
        {
            var client = _factory.CreateClient()
                .AuthenticatedAsSystemAdmin();

            using var scope = _factory.Services.NewTestScope();

            Assert.False(await scope.Db.EventCollections.AnyAsync());

            using var org = await scope.CreateOrganizationAsync(hostname: "localhost");
            var response = await client.PostAsync("/v3/events/collections", new StringContent(
                JsonConvert.SerializeObject(new
                {
                    organizationId = org.Entity.OrganizationId
                }), Encoding.UTF8, "application/json"));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            Assert.False(await scope.Db.EventCollections.AnyAsync());
        }

        [Fact]
        public async Task Should_Require_Org_For_New_Collection()
        {
            var client = _factory.CreateClient()
                .AuthenticatedAsSystemAdmin();

            using var scope = _factory.Services.NewTestScope();

            Assert.False(await scope.Db.EventCollections.AnyAsync());

            var response = await client.PostAsync("/v3/events/collections", new StringContent(
                JsonConvert.SerializeObject(new
                {
                    name = "Test"
                }), Encoding.UTF8, "application/json"));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            Assert.False(await scope.Db.EventCollections.AnyAsync());
        }

        [Fact]
        public async Task Should_Return_Not_Found_When_Updating_Non_Existing_Collection()
        {
            var client = _factory.CreateClient()
                .AuthenticatedAsSystemAdmin();

            var response = await client.PutAsync("/v3/events/collections/202", new StringContent(
                JsonConvert.SerializeObject(new
                {
                    name = "Updated",
                    organizationId = 1
                }), Encoding.UTF8, "application/json"));

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task Should_Not_Allow_To_Update_Collection_For_Non_Admin()
        {
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewTestScope();

            using var org = await scope.CreateOrganizationAsync(hostname: "some"); // not localhost

            using var collection = await scope.CreateEventCollectionAsync();
            await client.PutAsync($"/v3/events/collections/{collection.Entity.CollectionId}", new StringContent(
                JsonConvert.SerializeObject(new
                {
                    name = "Updated",
                    organizationId = collection.Entity.OrganizationId
                }), Encoding.UTF8, "application/json"));

            // FIXME: Not checking status here, it's OK since the app redirects to login screen!

            await CheckCollectionNotUpdatedAsync(collection.Entity);
        }

        [Fact]
        public async Task Should_Not_Allow_To_Update_Collection_For_Non_Current_Org()
        {
            using var scope = _factory.Services.NewTestScope();

            using var org = await scope.CreateOrganizationAsync(hostname: "some"); // not localhost
            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            using var collection = await scope.CreateEventCollectionAsync();

            var json = JsonConvert.SerializeObject(new
            {
                name = "Updated",
                organizationId = collection.Entity.OrganizationId
            });

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);

            await client.PutAsync($"/v3/events/collections/{collection.Entity.CollectionId}",
                new StringContent(json, Encoding.UTF8, "application/json"));

            // FIXME: Not checking status here, it's OK since the app redirects to login screen!

            await CheckCollectionNotUpdatedAsync(collection.Entity);
        }

        [Fact]
        public async Task Should_Allow_To_Update_Collection_To_Admin_Of_The_Current_Org()
        {
            using var scope = _factory.Services.NewTestScope();

            using var org = await scope.CreateOrganizationAsync(hostname: "localhost");
            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);

            using var collection = await scope.CreateEventCollectionAsync(organization: org.Entity);

            var response = await client.PutAsync($"/v3/events/collections/{collection.Entity.CollectionId}",
                new StringContent(JsonConvert.SerializeObject(new
                {
                    name = "Updated",
                    organizationId = org.Entity.OrganizationId
                }), Encoding.UTF8, "application/json"));

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            await CheckCollectionUpdatedAsync(collection.Entity, "Updated");
        }

        [Theory]
        [InlineData(Roles.SuperAdmin)]
        [InlineData(Roles.SystemAdmin)]
        public async Task Should_Allow_To_Update_Collection_To_Power_Admin(string role)
        {
            var client = _factory.CreateClient()
                .Authenticated(role: role);

            using var scope = _factory.Services.NewTestScope();


            using var collection = await scope.CreateEventCollectionAsync();

            var response = await client.PutAsync($"/v3/events/collections/{collection.Entity.CollectionId}",
                new StringContent(JsonConvert.SerializeObject(new
                {
                    name = "Updated",
                    organizationId = collection.Entity.OrganizationId
                }), Encoding.UTF8, "application/json"));

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            await CheckCollectionUpdatedAsync(collection.Entity, "Updated");
        }

        [Fact]
        public async Task Should_Update_All_Posted_Data()
        {
            var client = _factory.CreateClient()
                .AuthenticatedAsSystemAdmin();

            using var scope = _factory.Services.NewTestScope();


            using var collection = await scope.CreateEventCollectionAsync();
            using var newOrg = await scope.CreateOrganizationAsync();

            var response = await client.PutAsync($"/v3/events/collections/{collection.Entity.CollectionId}",
                new StringContent(JsonConvert.SerializeObject(new
                {
                    name = "Test",
                    organizationId = newOrg.Entity.OrganizationId,
                    slug = "Test slug",
                    description = "Test Description",
                    featured = true,
                    featuredImageUrl = "test://",
                    featuredImageCaption = "Test Caption",
                }), Encoding.UTF8, "application/json"));

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var updated = await scope.Db.EventCollections.AsNoTracking().SingleOrDefaultAsync();
            Assert.NotNull(updated);
            Assert.Equal(collection.Entity.CollectionId, updated.CollectionId);
            Assert.Equal("Test", updated.Name);
            Assert.Equal(newOrg.Entity.OrganizationId, updated.OrganizationId);
            Assert.Equal("Test slug", updated.Slug);
            Assert.Equal("Test Description", updated.Description);
            Assert.True(updated.Featured);
            Assert.Equal("test://", updated.FeaturedImageUrl);
            Assert.Equal("Test Caption", updated.FeaturedImageCaption);
        }

        [Fact]
        public async Task Should_Require_Collection_Name_For_Update()
        {
            var client = _factory.CreateClient()
                .AuthenticatedAsSystemAdmin();

            using var scope = _factory.Services.NewTestScope();

            using var collection = await scope.CreateEventCollectionAsync();

            var response = await client.PutAsync($"/v3/events/collections/{collection.Entity.CollectionId}",
                new StringContent(JsonConvert.SerializeObject(new
                {
                    organizationId = collection.Entity.OrganizationId
                }), Encoding.UTF8, "application/json"));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            await CheckCollectionNotUpdatedAsync(collection.Entity);
        }

        [Fact]
        public async Task Should_Require_Org_For_Collection_Update()
        {
            var client = _factory.CreateClient()
                .AuthenticatedAsSystemAdmin();

            using var scope = _factory.Services.NewTestScope();

            using var collection = await scope.CreateEventCollectionAsync();

            var response = await client.PutAsync($"/v3/events/collections/{collection.Entity.CollectionId}",
                new StringContent(JsonConvert.SerializeObject(new
                {
                    name = "Test"
                }), Encoding.UTF8, "application/json"));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            await CheckCollectionNotUpdatedAsync(collection.Entity);
        }

        [Fact]
        public async Task Should_Return_Not_Found_When_Deleting_Non_Existing_Collection()
        {
            var client = _factory.CreateClient()
                .AuthenticatedAsSystemAdmin();

            var response = await client.DeleteAsync("/v3/events/collections/202");
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task Should_Not_Allow_To_Delete_Collection_For_Non_Admin()
        {
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewTestScope();


            using var collection = await scope.CreateEventCollectionAsync();
            await client.DeleteAsync($"/v3/events/collections/{collection.Entity.CollectionId}");

            // FIXME: Not checking status here, it's OK since the app redirects to login screen!

            await CheckCollectionNotUpdatedAsync(collection.Entity);
        }

        [Fact]
        public async Task Should_Not_Allow_To_Delete_Collection_For_Non_Current_Org()
        {
            using var scope = _factory.Services.NewTestScope();

            using var org = await scope.CreateOrganizationAsync(hostname: "some"); // not localhost
            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);


            var client = _factory.CreateClient()
                .AuthenticatedAs(admin.Entity, Roles.Admin);

            using var collection = await scope.CreateEventCollectionAsync();

            await client.DeleteAsync($"/v3/events/collections/{collection.Entity.CollectionId}");

            // FIXME: Not checking status here, it's OK since the app redirects to login screen!

            await CheckCollectionNotUpdatedAsync(collection.Entity);
        }

        [Fact]
        public async Task Should_Allow_To_Delete_Collection_To_Admin_Of_The_Current_Org()
        {
            using var scope = _factory.Services.NewTestScope();

            var org = await scope.CreateOrganizationAsync(hostname: "localhost");
            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);

            var client = _factory.CreateClient()
                .AuthenticatedAs(admin.Entity, Roles.Admin);

            using var collection = await scope.CreateEventCollectionAsync(organization: org.Entity);

            var response = await client.DeleteAsync($"/v3/events/collections/{collection.Entity.CollectionId}");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.False(await scope.Db.EventCollections.AnyAsync(c => !c.Archived));
            Assert.NotNull(await scope.Db.EventCollections.SingleAsync(c => c.Archived));
        }

        [Theory]
        [InlineData(Roles.SuperAdmin)]
        [InlineData(Roles.SystemAdmin)]
        public async Task Should_Allow_To_Delete_Collection_To_Power_Admin(string role)
        {
            var client = _factory.CreateClient()
                .Authenticated(role: role);

            using var scope = _factory.Services.NewTestScope();


            using var collection = await scope.CreateEventCollectionAsync();

            var response = await client.DeleteAsync($"/v3/events/collections/{collection.Entity.CollectionId}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.False(await scope.Db.EventCollections.AnyAsync(c => !c.Archived));
            Assert.NotNull(await scope.Db.EventCollections.SingleAsync(c => c.Archived));
        }

        private async Task CheckCollectionUpdatedAsync(EventCollection collection, string name)
        {
            using var scope = _factory.Services.NewTestScope();

            var updated = await scope.Db.EventCollections.AsNoTracking().SingleOrDefaultAsync();
            Assert.NotNull(updated);
            Assert.Equal(collection.CollectionId, updated.CollectionId);
            Assert.NotEqual(collection.Name, updated.Name);
            Assert.Equal(name, updated.Name);
        }

        private async Task CheckCollectionNotUpdatedAsync(EventCollection collection)
        {
            using var scope = _factory.Services.NewTestScope();

            var updated = await scope.Db.EventCollections.AsNoTracking().SingleOrDefaultAsync();
            Assert.NotNull(updated);
            Assert.Equal(collection.CollectionId, updated.CollectionId);
            Assert.Equal(collection.Name, updated.Name);
        }
    }
}
