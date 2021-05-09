using Eventuras.Domain;
using Eventuras.Services;
using Eventuras.TestAbstractions;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Registrations
{
    public class RegistrationOrdersControllerTest : IClassFixture<CustomWebApiApplicationFactory<Startup>>
    {
        private readonly CustomWebApiApplicationFactory<Startup> _factory;

        public RegistrationOrdersControllerTest(CustomWebApiApplicationFactory<Startup> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task Should_Require_Auth_To_Create_Order()
        {
            var client = _factory.CreateClient();
            var response = await client.PostAsync("/v3/registrations/1/orders", new
            {
                items = new[]
                {
                    new {
                        productId = 1,
                        productVariantId = 2,
                        quantity = 3
                    }
                }
            });
            response.CheckUnauthorized();
        }

        public static object[][] GetInvalidOrders()
        {
            return new[]
            {
                new object[] {new { }},
                new object[] {new { productId = "test" }},
                new object[] {new { productId = -1 }},
                new object[] {new { productId = 0 }},
                new object[] {new { productId = 1, quantity = -1 }},
                new object[] {new { productId = 1, quantity = 0 }},
                new object[] {new { productId = 1, productVariantId = 0, quantity = 0 }},
                new object[] {new { productId = 1, productVariantId = -1, quantity = 0 }}
            };
        }

        [Theory]
        [MemberData(nameof(GetInvalidOrders))]
        public async Task Should_Validate_Order(object item)
        {
            var client = _factory.CreateClient().Authenticated();
            var response = await client.PostAsync("/v3/registrations/1/orders", new
            {
                items = new[] { item }
            });
            response.CheckBadRequest();
        }

        [Fact]
        public async Task Should_Return_NotFound_For_Non_Existing_Registration()
        {
            var client = _factory.CreateClient().Authenticated();
            var response = await client.PostAsync("/v3/registrations/1/orders", new
            {
                items = new[]
                {
                    new {
                        productId = 1,
                        productVariantId = 2,
                        quantity = 3
                    }
                }
            });
            response.CheckNotFound();
        }

        [Fact]
        public async Task Should_Not_Allow_Regular_User_To_Create_Order()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var e = await scope.CreateEventAsync();
            using var reg = await scope.CreateRegistrationAsync(e.Entity, user.Entity);

            var client = _factory.CreateClient().Authenticated();

            var response = await client.PostAsync($"/v3/registrations/{reg.Entity.RegistrationId}/orders", new
            {
                items = new[]
                {
                    new {
                        productId = 1,
                        productVariantId = 2,
                        quantity = 3
                    }
                }
            });
            response.CheckForbidden();
        }

        [Fact]
        public async Task Should_Not_Allow_Admin_To_Create_Order_For_Not_Accessible_Reg()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var org = await scope.CreateOrganizationAsync(hostname: "localhost");
            using var e = await scope.CreateEventAsync(organization: org.Entity);
            using var reg = await scope.CreateRegistrationAsync(e.Entity, user.Entity);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
            var response = await client.PostAsync($"/v3/registrations/{reg.Entity.RegistrationId}/orders", new
            {
                items = new[]
                {
                    new {
                        productId = 1,
                        productVariantId = 2,
                        quantity = 3
                    }
                }
            });
            response.CheckForbidden();
        }

        [Fact]
        public async Task Should_Allow_Admin_To_Create_Order_For_Accessible_Reg()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var org = await scope.CreateOrganizationAsync(hostname: "localhost");
            using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            using var e = await scope.CreateEventAsync(organization: org.Entity);
            using var reg = await scope.CreateRegistrationAsync(e.Entity, user.Entity);
            using var product = await scope.CreateProductAsync(e.Entity);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
            var response = await client.PostAsync($"/v3/registrations/{reg.Entity.RegistrationId}/orders", new
            {
                items = new[]
                {
                    new {
                        productId = product.Entity.ProductId,
                        quantity = 1
                    }
                }
            });
            response.CheckOk();

            await CheckOrderCreatedAsync(scope, reg.Entity, product.Entity);
        }

        [Fact]
        public async Task Should_Allow_System_Admin_To_Create_Order_For_Any_Reg()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var e = await scope.CreateEventAsync();
            using var product = await scope.CreateProductAsync(e.Entity);
            using var reg = await scope.CreateRegistrationAsync(e.Entity, user.Entity);

            var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
            var response = await client.PostAsync($"/v3/registrations/{reg.Entity.RegistrationId}/orders", new
            {
                items = new[]
                {
                    new {
                        productId = product.Entity.ProductId,
                        quantity = 1
                    }
                }
            });
            response.CheckOk();

            await CheckOrderCreatedAsync(scope, reg.Entity, product.Entity);
        }

        private async Task CheckOrderCreatedAsync(TestServiceScope scope, Registration reg, params Product[] products)
        {
            var order = await scope.Db.Orders
                .AsNoTracking()
                .Include(o => o.OrderLines)
                .SingleAsync(o => o.RegistrationId == reg.RegistrationId);

            Assert.Equal(products.Length, order.OrderLines.Count);
            Assert.All(order.OrderLines, line => Assert.Contains(products, p => p.ProductId == line.ProductId));
        }
    }
}
