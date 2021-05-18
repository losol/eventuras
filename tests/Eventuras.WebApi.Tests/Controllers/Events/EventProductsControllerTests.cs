using System;
using System.Threading.Tasks;
using Eventuras.Services;
using Eventuras.TestAbstractions;
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
    }
}