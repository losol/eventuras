using System;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Eventuras.TestAbstractions;
using Xunit;

namespace Eventuras.IntegrationTests.Controllers.Api.V2
{
    public class EventCollectionControllerTest : IClassFixture<CustomWebApplicationFactory<Startup>>, IDisposable
    {
        private readonly CustomWebApplicationFactory<Startup> _factory;

        public EventCollectionControllerTest(CustomWebApplicationFactory<Startup> factory)
        {
            _factory = factory;
            Cleanup();
        }


        public void Dispose()
        {
            Cleanup();
        }

        private void Cleanup()
        {
            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            context.EventCollections.RemoveRange(context.EventCollections.ToArray());
            context.Organizations.RemoveRange(context.Organizations.ToArray());
            context.SaveChanges();
        }

        [Fact]
        public async Task Should_Return_Empty_List()
        {
            var client = _factory.CreateClient();

            var response = await client.GetAsync("/api/v2/events/collections");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            JArray.Parse(content).CheckEmptyArray();
        }

        [Fact]
        public async Task Should_Return_Collection_List_Sorted_By_Name()
        {
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            using var c2 = await context.CreateEventCollectionAsync("Collection 2");
            using var c1 = await context.CreateEventCollectionAsync("Collection 1");

            var response = await client.GetAsync("/api/v2/events/collections");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            JArray.Parse(content).CheckArray((token, c) => token.CheckEventCollection(c),
                c1.Entity, c2.Entity);
        }

        [Fact]
        public async Task Should_Not_Return_Collections_From_Other_Organization()
        {
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            using var org1 = await context.CreateOrganizationAsync(hostname: "localhost");
            using var org2 = await context.CreateOrganizationAsync(hostname: "another");

            using var c1 = await context.CreateEventCollectionAsync("Collection 1", organization: org1.Entity);
            using var c2 = await context.CreateEventCollectionAsync("Collection 2", organization: org2.Entity);

            using var adminOfOrg1 = await scope.ServiceProvider.CreateUserAsync(role: Roles.Admin);
            using var member1 = await context.CreateOrganizationMemberAsync(adminOfOrg1.Entity, org1.Entity, role: Roles.Admin);
            await client.LoginAsync(adminOfOrg1.Entity.Email, ServiceProviderExtensions.DefaultPassword);

            var response = await client.GetAsync("/api/v2/events/collections");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            JArray.Parse(content).CheckArray((token, c) => token.CheckEventCollection(c), c1.Entity);
        }

        [Fact]
        public async Task Should_Return_All_Collections_If_No_Current_Org()
        {
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            using var org1 = await context.CreateOrganizationAsync(hostname: "some"); // not localhost
            using var org2 = await context.CreateOrganizationAsync(hostname: "another"); // not localhost, too

            using var c1 = await context.CreateEventCollectionAsync("Collection 1", organization: org1.Entity);
            using var c2 = await context.CreateEventCollectionAsync("Collection 2", organization: org2.Entity);

            using var admin = await scope.ServiceProvider.CreateUserAsync(role: Roles.Admin);
            using var member = await context.CreateOrganizationMemberAsync(admin.Entity, org1.Entity, role: Roles.Admin);
            await client.LoginAsync(admin.Entity.Email, ServiceProviderExtensions.DefaultPassword);

            var response = await client.GetAsync("/api/v2/events/collections");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            JArray.Parse(content).CheckArray((token, c) => token.CheckEventCollection(c), c1.Entity, c2.Entity);
        }

        [Fact]
        public async Task Should_Return_Not_Found_For_Unknown_Collection_Id()
        {
            var client = _factory.CreateClient();
            var response = await client.GetAsync("/api/v2/events/collections/2020");
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task Should_Return_Collection_Info()
        {
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            using var collection = await context.CreateEventCollectionAsync();

            var response = await client.GetAsync($"/api/v2/events/collections/{collection.Entity.CollectionId}");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            JObject.Parse(content).CheckEventCollection(collection.Entity);
        }

        [Fact]
        public async Task Should_Not_Allow_To_Create_New_Collection_To_Non_Admin()
        {
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            using var org = await context.CreateOrganizationAsync(hostname: "some"); // not localhost

            await client.PostAsync("/api/v2/events/collections", new StringContent(JsonConvert.SerializeObject(new
            {
                name = "Test",
                organizationId = org.Entity.OrganizationId
            }), Encoding.UTF8, "application/json"));

            // FIXME: Not checking status here, it's OK since the app redirects to login screen!

            Assert.False(await context.EventCollections.AnyAsync());
        }

        [Fact]
        public async Task Should_Not_Allow_To_Create_New_Collection_For_Non_Current_Org()
        {
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            using var org = await context.CreateOrganizationAsync(hostname: "some"); // not localhost
            using var admin = await scope.ServiceProvider.CreateUserAsync(role: Roles.Admin);
            using var member = await context.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            await client.LoginAsync(admin.Entity.Email, ServiceProviderExtensions.DefaultPassword);

            var json = JsonConvert.SerializeObject(new
            {
                name = "Test",
                organizationId = org.Entity.OrganizationId
            });

            await client.PostAsync("/api/v2/events/collections",
                new StringContent(json, Encoding.UTF8, "application/json"));

            // FIXME: Not checking status here, it's OK since the app redirects to login screen!

            Assert.False(await context.EventCollections.AnyAsync());
        }

        [Fact]
        public async Task Should_Allow_To_Create_New_Collection_To_Admin_Of_The_Current_Org()
        {
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            using var org = await context.CreateOrganizationAsync(hostname: "localhost");
            using var admin = await scope.ServiceProvider.CreateUserAsync(role: Roles.Admin);
            using var member = await context.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            await client.LoginAsync(admin.Entity.Email, ServiceProviderExtensions.DefaultPassword);

            Assert.False(await context.EventCollections.AnyAsync());

            var response = await client.PostAsync("/api/v2/events/collections", new StringContent(JsonConvert.SerializeObject(new
            {
                name = "Test",
                organizationId = org.Entity.OrganizationId
            }), Encoding.UTF8, "application/json"));

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var collection = await context.EventCollections.AsNoTracking().SingleOrDefaultAsync();
            Assert.NotNull(collection);
            Assert.Equal("Test", collection.Name);
        }

        [Fact]
        public async Task Should_Allow_To_Create_New_Collection_To_Super_Admin()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            Assert.False(await context.EventCollections.AnyAsync());

            using var org = await context.CreateOrganizationAsync();
            var response = await client.PostAsync("/api/v2/events/collections", new StringContent(JsonConvert.SerializeObject(new
            {
                name = "Test",
                organizationId = org.Entity.OrganizationId
            }), Encoding.UTF8, "application/json"));

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var collection = await context.EventCollections.AsNoTracking().SingleOrDefaultAsync();
            Assert.NotNull(collection);
            Assert.Equal("Test", collection.Name);
        }

        [Fact]
        public async Task Should_Save_All_Posted_Data()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            Assert.False(await context.EventCollections.AnyAsync());

            using var org = await context.CreateOrganizationAsync();
            var response = await client.PostAsync("/api/v2/events/collections", new StringContent(JsonConvert.SerializeObject(new
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

            var collection = await context.EventCollections.AsNoTracking().SingleOrDefaultAsync();
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
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            Assert.False(await context.EventCollections.AnyAsync());

            using var org = await context.CreateOrganizationAsync(hostname: "localhost");
            var response = await client.PostAsync("/api/v2/events/collections", new StringContent(JsonConvert.SerializeObject(new
            {
                organizationId = org.Entity.OrganizationId
            }), Encoding.UTF8, "application/json"));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            Assert.False(await context.EventCollections.AnyAsync());
        }

        [Fact]
        public async Task Should_Require_Org_For_New_Collection()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            Assert.False(await context.EventCollections.AnyAsync());

            var response = await client.PostAsync("/api/v2/events/collections", new StringContent(JsonConvert.SerializeObject(new
            {
                name = "Test"
            }), Encoding.UTF8, "application/json"));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            Assert.False(await context.EventCollections.AnyAsync());
        }

        [Fact]
        public async Task Should_Return_Not_Found_When_Updating_Non_Existing_Collection()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            var response = await client.PutAsync("/api/v2/events/collections/202", new StringContent(JsonConvert.SerializeObject(new
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

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            using var org = await context.CreateOrganizationAsync(hostname: "some"); // not localhost

            using var collection = await context.CreateEventCollectionAsync();
            await client.PutAsync($"/api/v2/events/collections/{collection.Entity.CollectionId}", new StringContent(JsonConvert.SerializeObject(new
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
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            using var org = await context.CreateOrganizationAsync(hostname: "some"); // not localhost
            using var admin = await scope.ServiceProvider.CreateUserAsync(role: Roles.Admin);
            using var member = await context.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            await client.LoginAsync(admin.Entity.Email, ServiceProviderExtensions.DefaultPassword);

            using var collection = await context.CreateEventCollectionAsync();

            var json = JsonConvert.SerializeObject(new
            {
                name = "Updated",
                organizationId = collection.Entity.OrganizationId
            });

            await client.PutAsync($"/api/v2/events/collections/{collection.Entity.CollectionId}",
                new StringContent(json, Encoding.UTF8, "application/json"));

            // FIXME: Not checking status here, it's OK since the app redirects to login screen!

            await CheckCollectionNotUpdatedAsync(collection.Entity);
        }

        [Fact]
        public async Task Should_Allow_To_Update_Collection_To_Admin_Of_The_Current_Org()
        {
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            using var org = await context.CreateOrganizationAsync(hostname: "localhost");
            using var admin = await scope.ServiceProvider.CreateUserAsync(role: Roles.Admin);
            using var member = await context.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            await client.LoginAsync(admin.Entity.Email, ServiceProviderExtensions.DefaultPassword);

            using var collection = await context.CreateEventCollectionAsync(organization: org.Entity);

            var response = await client.PutAsync($"/api/v2/events/collections/{collection.Entity.CollectionId}", new StringContent(JsonConvert.SerializeObject(new
            {
                name = "Updated",
                organizationId = org.Entity.OrganizationId
            }), Encoding.UTF8, "application/json"));

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            await CheckCollectionUpdatedAsync(collection.Entity, "Updated");
        }

        [Fact]
        public async Task Should_Allow_To_Update_Collection_To_Super_Admin()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            using var collection = await context.CreateEventCollectionAsync();

            var response = await client.PutAsync($"/api/v2/events/collections/{collection.Entity.CollectionId}", new StringContent(JsonConvert.SerializeObject(new
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
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            using var collection = await context.CreateEventCollectionAsync();
            using var newOrg = await context.CreateOrganizationAsync();

            var response = await client.PutAsync($"/api/v2/events/collections/{collection.Entity.CollectionId}", new StringContent(JsonConvert.SerializeObject(new
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

            var updated = await context.EventCollections.AsNoTracking().SingleOrDefaultAsync();
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
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            using var collection = await context.CreateEventCollectionAsync();

            var response = await client.PutAsync($"/api/v2/events/collections/{collection.Entity.CollectionId}", new StringContent(JsonConvert.SerializeObject(new
            {
                organizationId = collection.Entity.OrganizationId
            }), Encoding.UTF8, "application/json"));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            await CheckCollectionNotUpdatedAsync(collection.Entity);
        }

        [Fact]
        public async Task Should_Require_Org_For_Collection_Update()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            using var collection = await context.CreateEventCollectionAsync();

            var response = await client.PutAsync($"/api/v2/events/collections/{collection.Entity.CollectionId}", new StringContent(JsonConvert.SerializeObject(new
            {
                name = "Test"
            }), Encoding.UTF8, "application/json"));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            await CheckCollectionNotUpdatedAsync(collection.Entity);
        }

        [Fact]
        public async Task Should_Return_Not_Found_When_Deleting_Non_Existing_Collection()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            var response = await client.DeleteAsync("/api/v2/events/collections/202");
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task Should_Not_Allow_To_Delete_Collection_For_Non_Admin()
        {
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            using var collection = await context.CreateEventCollectionAsync();
            await client.DeleteAsync($"/api/v2/events/collections/{collection.Entity.CollectionId}");

            // FIXME: Not checking status here, it's OK since the app redirects to login screen!

            await CheckCollectionNotUpdatedAsync(collection.Entity);
        }

        [Fact]
        public async Task Should_Not_Allow_To_Delete_Collection_For_Non_Current_Org()
        {
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            using var org = await context.CreateOrganizationAsync(hostname: "some"); // not localhost
            using var admin = await scope.ServiceProvider.CreateUserAsync(role: Roles.Admin);
            using var member = await context.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            await client.LoginAsync(admin.Entity.Email, ServiceProviderExtensions.DefaultPassword);

            using var collection = await context.CreateEventCollectionAsync();

            await client.DeleteAsync($"/api/v2/events/collections/{collection.Entity.CollectionId}");

            // FIXME: Not checking status here, it's OK since the app redirects to login screen!

            await CheckCollectionNotUpdatedAsync(collection.Entity);
        }

        [Fact]
        public async Task Should_Allow_To_Delete_Collection_To_Admin_Of_The_Current_Org()
        {
            var client = _factory.CreateClient();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var org = await context.CreateOrganizationAsync(hostname: "localhost");
            using var admin = await scope.ServiceProvider.CreateUserAsync(role: Roles.Admin);
            using var member = await context.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            await client.LoginAsync(admin.Entity.Email, ServiceProviderExtensions.DefaultPassword);

            var collection = await context.CreateEventCollectionAsync(organization: org.Entity);

            var response = await client.DeleteAsync($"/api/v2/events/collections/{collection.Entity.CollectionId}");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.False(await context.EventCollections.AnyAsync());
        }

        [Fact]
        public async Task Should_Allow_To_Delete_Collection_To_Super_Admin()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var collection = await context.CreateEventCollectionAsync();

            var response = await client.DeleteAsync($"/api/v2/events/collections/{collection.Entity.CollectionId}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.False(await context.EventCollections.AnyAsync());
        }

        private async Task CheckCollectionUpdatedAsync(EventCollection collection, string name)
        {
            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var updated = await context.EventCollections.AsNoTracking().SingleOrDefaultAsync();
            Assert.NotNull(updated);
            Assert.Equal(collection.CollectionId, updated.CollectionId);
            Assert.NotEqual(collection.Name, updated.Name);
            Assert.Equal(name, updated.Name);
        }

        private async Task CheckCollectionNotUpdatedAsync(EventCollection collection)
        {
            using var scope = _factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var updated = await context.EventCollections.AsNoTracking().SingleOrDefaultAsync();
            Assert.NotNull(updated);
            Assert.Equal(collection.CollectionId, updated.CollectionId);
            Assert.Equal(collection.Name, updated.Name);
        }
    }
}
