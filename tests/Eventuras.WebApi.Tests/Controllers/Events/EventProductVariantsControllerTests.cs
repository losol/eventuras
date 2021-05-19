using System;
using System.Threading.Tasks;
using Eventuras.Services;
using Eventuras.TestAbstractions;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Events
{
    public class EventProductVariantsControllerTests : IClassFixture<CustomWebApiApplicationFactory<Startup>>
    {
        private readonly CustomWebApiApplicationFactory<Startup> _factory;

        public EventProductVariantsControllerTests(CustomWebApiApplicationFactory<Startup> factory)
        {
            _factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        #region List

        [Fact]
        public async Task Should_Not_Require_Auth_To_List_Product_Variants()
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync();
            using var product = await scope.CreateProductAsync(evt.Entity);

            var client = _factory.CreateClient();
            var response =
                await client.GetAsync(
                    $"/v3/events/{evt.Entity.EventInfoId}/products/{product.Entity.ProductId}/variants");
            response.CheckOk();

            var token = await response.AsArrayAsync();
            token.CheckEmptyArray();
        }

        [Fact]
        public async Task Should_Return_Not_Found_When_Listing_Variants_For_Unknown_Event()
        {
            var client = _factory.CreateClient();
            var response =
                await client.GetAsync(
                    "/v3/events/123/products/4456/variants");
            response.CheckNotFound();
        }

        [Fact]
        public async Task Should_Return_Not_Found_When_Listing_Variants_For_Unknown_Product()
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync();

            var client = _factory.CreateClient();
            var response =
                await client.GetAsync(
                    $"/v3/events/{evt.Entity.EventInfoId}/products/4456/variants");
            response.CheckNotFound();
        }

        [Theory]
        [InlineData(null)]
        [InlineData(Roles.Admin)]
        [InlineData(Roles.SuperAdmin)]
        [InlineData(Roles.SystemAdmin)]
        public async Task Should_Allow_Authenticated_User_To_List_Product_Variants(string role)
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync();
            using var product = await scope.CreateProductAsync(evt.Entity);
            using var v1 = await scope.CreateProductVariantAsync(product.Entity, "v1");
            using var v2 = await scope.CreateProductVariantAsync(product.Entity, "v2");

            var client = _factory.CreateClient()
                .Authenticated(role: role);

            var response =
                await client.GetAsync(
                    $"/v3/events/{evt.Entity.EventInfoId}/products/{product.Entity.ProductId}/variants");
            response.CheckOk();

            var token = await response.AsArrayAsync();
            token.CheckArray((t, v) => t.CheckProductVariant(v),
                v1.Entity, v2.Entity);
        }

        #endregion
    }
}