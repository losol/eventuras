using System;
using System.Threading.Tasks;
using Eventuras.Services;
using Eventuras.TestAbstractions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Events
{
    public class EventProductsControllerTests : IClassFixture<CustomWebApiApplicationFactory<Startup>>
    {
        private readonly CustomWebApiApplicationFactory<Startup> _factory;

        public EventProductsControllerTests(CustomWebApiApplicationFactory<Startup> factory)
        {
            _factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        #region List

        [Fact]
        public async Task List_Should_Not_Require_Auth()
        {
            var client = _factory.CreateClient();
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync();

            var response = await client.GetAsync($"/v3/events/{evt.Entity.EventInfoId}/products");
            response.CheckOk();

            var arr = await response.AsArrayAsync();
            arr.CheckEmptyArray();
        }

        [Fact]
        public async Task List_Should_Return_Not_Found_For_Non_Existing_Event()
        {
            var client = _factory.CreateClient();
            var response = await client.GetAsync("/v3/events/1002/products");
            response.CheckNotFound();
        }

        [Fact]
        public async Task List_Should_Not_Return_Archived_Products()
        {
            var client = _factory.CreateClient();
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync();
            using var p1 = await scope.CreateProductAsync(evt.Entity, archived: true);
            using var p2 = await scope.CreateProductAsync(evt.Entity);

            var response = await client.GetAsync($"/v3/events/{evt.Entity.EventInfoId}/products");
            response.CheckOk();

            var arr = await response.AsArrayAsync();
            arr.CheckArray((t, p) => t.CheckProduct(p), p2.Entity);
        }

        [Fact]
        public async Task List_Should_Not_Return_Archived_Product_Variants()
        {
            var client = _factory.CreateClient();
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync();
            using var product = await scope.CreateProductAsync(evt.Entity);
            using var v1 = await scope.CreateProductVariantAsync(product.Entity, archived: true);
            using var v2 = await scope.CreateProductVariantAsync(product.Entity);
            using var v3 = await scope.CreateProductVariantAsync(product.Entity, archived: true);
            using var v4 = await scope.CreateProductVariantAsync(product.Entity);

            var response = await client.GetAsync($"/v3/events/{evt.Entity.EventInfoId}/products");
            response.CheckOk();

            var arr = await response.AsArrayAsync();
            arr.CheckArray((t, p) => t
                    .CheckProduct(p, v2.Entity, v4.Entity),
                product.Entity);
        }

        [Theory]
        [InlineData(Roles.Admin)]
        [InlineData(Roles.SuperAdmin)]
        [InlineData(Roles.SystemAdmin)]
        public async Task List_Should_Be_Available_For_Any_Logged_In_User(string role)
        {
            var client = _factory.CreateClient().Authenticated(role: role);
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync();
            using var product = await scope.CreateProductAsync(evt.Entity);

            var response = await client.GetAsync($"/v3/events/{evt.Entity.EventInfoId}/products");
            response.CheckOk();

            var arr = await response.AsArrayAsync();
            arr.CheckArray((t, p) => t.CheckProduct(p), product.Entity);
        }

        [Fact]
        public async Task List_Should_Return_Products_For_The_Given_Event_Only()
        {
            var client = _factory.CreateClient();
            using var scope = _factory.Services.NewTestScope();
            using var e1 = await scope.CreateEventAsync();
            using var e2 = await scope.CreateEventAsync();
            using var p1 = await scope.CreateProductAsync(e1.Entity);
            using var p2 = await scope.CreateProductAsync(e2.Entity);

            var response = await client.GetAsync($"/v3/events/{e1.Entity.EventInfoId}/products");
            response.CheckOk();

            var arr = await response.AsArrayAsync();
            arr.CheckArray((t, p) => t.CheckProduct(p), p1.Entity);

            response = await client.GetAsync($"/v3/events/{e2.Entity.EventInfoId}/products");
            response.CheckOk();

            arr = await response.AsArrayAsync();
            arr.CheckArray((t, p) => t.CheckProduct(p), p2.Entity);
        }

        #endregion

        #region Add

        [Fact]
        public async Task Add_Should_Require_Auth()
        {
            var client = _factory.CreateClient();
            var response = await client.PostAsync("/v3/events/1/products");
            response.CheckUnauthorized();
        }

        public static object[][] GetInvalidAddFormInput()
        {
            return new[]
            {
                new object[] {new {name = (string) null}},
                new object[] {new {name = ""}},
                new object[] {new {name = "   "}}
            };
        }

        [Theory]
        [MemberData(nameof(GetInvalidAddFormInput))]
        public async Task Add_Should_Validate_Request_Body(object body)
        {
            var client = _factory.CreateClient().Authenticated(role: Roles.Admin);
            var response = await client.PostAsync("/v3/events/1/products", body);
            response.CheckBadRequest();
        }

        [Fact]
        public async Task Add_Should_Return_Not_Found_For_Non_Existing_Event()
        {
            var client = _factory.CreateClient().Authenticated(role: Roles.Admin);
            using var scope = _factory.Services.NewTestScope();
            var response = await client.PostAsync("/v3/events/1001/products", new {name = "test"});
            response.CheckNotFound();
        }

        [Fact]
        public async Task Add_Should_Require_Admin_Role()
        {
            var client = _factory.CreateClient().Authenticated();
            var response = await client.PostAsync("/v3/events/1/products", new {name = "test"});
            response.CheckForbidden();
        }

        [Fact]
        public async Task Add_Should_Check_Admin_Org()
        {
            using var scope = _factory.Services.NewTestScope();
            using var org1 = await scope.CreateOrganizationAsync(hostname: "localhost");
            using var org2 = await scope.CreateOrganizationAsync();
            using var admin = await scope.CreateUserAsync();
            using var m = await scope.CreateOrganizationMemberAsync(admin.Entity, org2.Entity, role: Roles.Admin);
            using var evt = await scope.CreateEventAsync(organization: org1.Entity);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);

            var response = await client.PostAsync($"/v3/events/{evt.Entity.EventInfoId}/products", new {name = "test"});
            response.CheckForbidden();
        }

        [Fact]
        public async Task Add_Should_Check_Event_Org()
        {
            using var scope = _factory.Services.NewTestScope();
            using var org1 = await scope.CreateOrganizationAsync(hostname: "localhost");
            using var org2 = await scope.CreateOrganizationAsync();
            using var admin = await scope.CreateUserAsync();
            using var m = await scope.CreateOrganizationMemberAsync(admin.Entity, org1.Entity, role: Roles.Admin);
            using var evt = await scope.CreateEventAsync(organization: org2.Entity);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);

            var response = await client.PostAsync($"/v3/events/{evt.Entity.EventInfoId}/products", new {name = "test"});
            response.CheckForbidden();
        }

        [Theory]
        [InlineData(Roles.SuperAdmin)]
        [InlineData(Roles.SystemAdmin)]
        public async Task Add_Should_Be_Available_For_Power_Admin(string role)
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync();

            var client = _factory.CreateClient().Authenticated(role: role);
            var response = await client.PostAsync($"/v3/events/{evt.Entity.EventInfoId}/products", new {name = "test"});
            response.CheckOk();

            var product = await scope.Db.Products
                .SingleOrDefaultAsync(p => p.EventInfoId == evt.Entity.EventInfoId);

            Assert.NotNull(product);
            Assert.Equal("test", product.Name);
            Assert.Null(product.Description);
            Assert.Null(product.MoreInformation);
            Assert.False(product.Archived);
            Assert.Equal(0, product.Price);
            Assert.Equal(0, product.VatPercent);

            var token = await response.AsTokenAsync();
            token.CheckProduct(product);
        }

        [Fact]
        public async Task Add_Should_Allow_Org_Admin_To_Add_New_Product_With_Max_Data()
        {
            using var scope = _factory.Services.NewTestScope();
            using var org = await scope.CreateOrganizationAsync(hostname: "localhost");
            using var admin = await scope.CreateUserAsync();
            using var m = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            using var evt = await scope.CreateEventAsync(organization: org.Entity);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);

            var response = await client.PostAsync($"/v3/events/{evt.Entity.EventInfoId}/products", new
            {
                name = "test",
                description = "desc",
                more = "more",
                price = 999.44,
                vatPercent = 10
            });
            response.CheckOk();

            var product = await scope.Db.Products
                .SingleOrDefaultAsync(p => p.EventInfoId == evt.Entity.EventInfoId);

            Assert.NotNull(product);
            Assert.Equal("test", product.Name);
            Assert.Equal("desc", product.Description);
            Assert.Equal("more", product.MoreInformation);
            Assert.False(product.Archived);
            Assert.Equal((decimal) 999.44, product.Price);
            Assert.Equal(10, product.VatPercent);

            var token = await response.AsTokenAsync();
            token.CheckProduct(product);
        }

        #endregion

        #region Archive

        [Fact]
        public async Task Should_Require_Auth_To_Archive_Product()
        {
            var client = _factory.CreateClient();
            var response = await client.DeleteAsync("/v3/events/1/products/2");
            response.CheckUnauthorized();
        }

        [Fact]
        public async Task Should_Return_NotFound_For_Non_Existing_Event()
        {
            var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
            var response = await client.DeleteAsync("/v3/events/1001/products/2");
            response.CheckNotFound();
        }

        [Fact]
        public async Task Should_Return_NotFound_For_Non_Existing_Product()
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync();

            var client = _factory.CreateClient().AuthenticatedAsAdmin();
            var response = await client.DeleteAsync($"/v3/events/{evt.Entity.EventInfoId}/products/23");
            response.CheckNotFound();
        }

        [Fact]
        public async Task Should_Return_Ok_For_Archived_Product()
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync();
            using var product = await scope.CreateProductAsync(evt.Entity, archived: true);

            var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
            var response =
                await client.DeleteAsync($"/v3/events/{evt.Entity.EventInfoId}/products/{product.Entity.ProductId}");
            response.CheckOk();
        }

        [Fact]
        public async Task Should_Require_Admin_Role_To_Archive_Product()
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync();
            using var product = await scope.CreateProductAsync(evt.Entity, archived: true);

            var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
            var response =
                await client.DeleteAsync($"/v3/events/{evt.Entity.EventInfoId}/products/{product.Entity.ProductId}");
            response.CheckOk();
        }

        [Fact]
        public async Task Should_Check_Admin_Org_When_Archiving_Product()
        {
            using var scope = _factory.Services.NewTestScope();
            using var org1 = await scope.CreateOrganizationAsync(hostname: "localhost");
            using var org2 = await scope.CreateOrganizationAsync();
            using var admin = await scope.CreateUserAsync();
            using var m = await scope.CreateOrganizationMemberAsync(admin.Entity, org2.Entity, role: Roles.Admin);
            using var evt = await scope.CreateEventAsync(organization: org1.Entity);
            using var product = await scope.CreateProductAsync(evt.Entity);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
            var response =
                await client.DeleteAsync($"/v3/events/{evt.Entity.EventInfoId}/products/{product.Entity.ProductId}");
            response.CheckForbidden();
        }

        [Fact]
        public async Task Should_Check_Event_Org_When_Archiving_Product()
        {
            using var scope = _factory.Services.NewTestScope();
            using var org1 = await scope.CreateOrganizationAsync(hostname: "localhost");
            using var org2 = await scope.CreateOrganizationAsync();
            using var admin = await scope.CreateUserAsync();
            using var m = await scope.CreateOrganizationMemberAsync(admin.Entity, org1.Entity, role: Roles.Admin);
            using var evt = await scope.CreateEventAsync(organization: org2.Entity);
            using var product = await scope.CreateProductAsync(evt.Entity);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
            var response =
                await client.DeleteAsync($"/v3/events/{evt.Entity.EventInfoId}/products/{product.Entity.ProductId}");
            response.CheckForbidden();
        }

        [Fact]
        public async Task Should_Allow_Org_Admin_To_Archive_Product()
        {
            using var scope = _factory.Services.NewTestScope();
            using var org = await scope.CreateOrganizationAsync(hostname: "localhost");
            using var admin = await scope.CreateUserAsync();
            using var m = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            using var evt = await scope.CreateEventAsync(organization: org.Entity);
            using var product = await scope.CreateProductAsync(evt.Entity);
            Assert.False(product.Entity.Archived);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
            var response =
                await client.DeleteAsync($"/v3/events/{evt.Entity.EventInfoId}/products/{product.Entity.ProductId}");
            response.CheckOk();

            var updatedProduct =
                await scope.Db.Products
                    .AsNoTracking()
                    .SingleOrDefaultAsync(p => p.ProductId == product.Entity.ProductId);

            Assert.NotNull(updatedProduct);
            Assert.True(updatedProduct.Archived);
        }

        [Theory]
        [InlineData(Roles.SuperAdmin)]
        [InlineData(Roles.SystemAdmin)]
        public async Task Should_Allow_Power_Admin_To_Archive_Product(string role)
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync();
            using var product = await scope.CreateProductAsync(evt.Entity);
            Assert.False(product.Entity.Archived);

            var client = _factory.CreateClient().Authenticated(role: role);
            var response =
                await client.DeleteAsync($"/v3/events/{evt.Entity.EventInfoId}/products/{product.Entity.ProductId}");
            response.CheckOk();

            var updatedProduct =
                await scope.Db.Products
                    .AsNoTracking()
                    .SingleOrDefaultAsync(p => p.ProductId == product.Entity.ProductId);

            Assert.NotNull(updatedProduct);
            Assert.True(updatedProduct.Archived);
        }

        #endregion
    }
}