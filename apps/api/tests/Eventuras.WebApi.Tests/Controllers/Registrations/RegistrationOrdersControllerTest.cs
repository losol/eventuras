using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services;
using Eventuras.Services.Orders;
using Eventuras.TestAbstractions;
using Eventuras.WebApi.Controllers.v3.Orders;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Registrations;

public class RegistrationOrdersControllerTest : IClassFixture<CustomWebApiApplicationFactory<Program>>
{
    private readonly CustomWebApiApplicationFactory<Program> _factory;

    public RegistrationOrdersControllerTest(CustomWebApiApplicationFactory<Program> factory) => _factory = factory;

    private async Task<Order> CheckOrderCreatedAsync(TestServiceScope scope, Registration reg,
        params Product[] products)
    {
        var order = await scope.Db.Orders
            .AsNoTracking()
            .Include(o => o.OrderLines)
            .SingleAsync(o => o.RegistrationId == reg.RegistrationId);

        Assert.Equal(products.Length, order.OrderLines.Count);
        Assert.All(order.OrderLines, line => Assert.Contains(products, p => p.ProductId == line.ProductId));

        return order;
    }

    private static void CheckRegistrationOrderedProducts(IServiceScope scope, int registrationId,
        params OrderLineModel[] expectedLines)
    {
        var dbCtx = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var reg = dbCtx.Registrations
            .Include(registration => registration.Orders)
            .ThenInclude(order => order.OrderLines)
            .Single(r => r.RegistrationId == registrationId);

        var expectedLinesSanitized = SanitizeOrderLines(expectedLines).OrderBy(ol => ol.ProductId)
            .ThenBy(ol => ol.ProductVariantId);

        var regOrderLines = reg.Orders.SelectMany(o => o.OrderLines).Select(OrderLineModel.FromOrderLineDomainModel);
        var regOrderLinesSanitized = SanitizeOrderLines(regOrderLines).OrderBy(ol => ol.ProductId)
            .ThenBy(ol => ol.ProductVariantId);

        Assert.Equal(expectedLinesSanitized, regOrderLinesSanitized);

        return;

        static IEnumerable<OrderLineModel> SanitizeOrderLines(IEnumerable<OrderLineModel> orderLineModels)
        {
            var sanitized = orderLineModels

                // combine duplications of same products in order lines into single order line
                .GroupBy(ol => new { ol.ProductId, ol.ProductVariantId })
                .Select(group =>
                    new OrderLineModel(group.Key.ProductId, group.Key.ProductVariantId, group.Sum(ol => ol.Quantity)))

                // remove order lines with zero quantity
                .Where(ol => ol.Quantity != 0);

            return sanitized.ToArray();
        }
    }

    #region Create

    [Fact]
    public async Task Should_Require_Auth_To_Create_Order()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsync("/v3/registrations/1/orders",
            new { items = new[] { new { productId = 1, productVariantId = 2, quantity = 3 } } });
        response.CheckUnauthorized();
    }

    public static object[][] GetInvalidOrders() =>
        new[]
        {
            new object[] { new { } }, new object[] { new { productId = "test" } },
            new object[] { new { productId = -1 } }, new object[] { new { productId = 0 } },
            new object[] { new { productId = 1, quantity = -1 } },
            new object[] { new { productId = 1, quantity = 0 } },
            new object[] { new { productId = 1, productVariantId = 0, quantity = 0 } },
            new object[] { new { productId = 1, productVariantId = -1, quantity = 0 } }
        };

    [Theory]
    [MemberData(nameof(GetInvalidOrders))]
    public async Task Should_Validate_Order(object item)
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var e = await scope.CreateEventAsync();
        using var reg = await scope.CreateRegistrationAsync(e.Entity, user.Entity);

        var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();

        var response = await client.PostAsync($"/v3/registrations/{reg.Entity.RegistrationId}/orders",
            new { items = new[] { item } });
        response.CheckBadRequest();
    }

    [Fact]
    public async Task Should_Return_NotFound_For_Non_Existing_Registration()
    {
        var randomId = Random.Shared.Next(1000000, int.MaxValue);

        var client = _factory.CreateClient().Authenticated();
        var response = await client.PostAsync($"/v3/registrations/{randomId}/orders",
            new { items = new[] { new { productId = 1, productVariantId = 2, quantity = 3 } } });
        response.CheckNotFound();
    }

    [Fact]
    public async Task Should_Not_Allow_Regular_User_To_Create_Order_For_Someone_Elses_Reg()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var otherUser = await scope.CreateUserAsync();
        using var e = await scope.CreateEventAsync();
        using var reg = await scope.CreateRegistrationAsync(e.Entity, otherUser.Entity);

        var client = _factory.CreateClient().AuthenticatedAs(user.Entity);

        var response = await client.PostAsync($"/v3/registrations/{reg.Entity.RegistrationId}/orders",
            new { items = new[] { new { productId = 1, productVariantId = 2, quantity = 3 } } });
        response.CheckForbidden();
    }

    [Fact]
    public async Task Should_Allow_Regular_User_To_Create_Order_For_Own_Reg()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var e = await scope.CreateEventAsync();
        using var reg = await scope.CreateRegistrationAsync(e.Entity, user.Entity);
        using var product = await scope.CreateProductAsync(e.Entity);

        var client = _factory.CreateClient().AuthenticatedAs(user.Entity);

        var response = await client.PostAsync($"/v3/registrations/{reg.Entity.RegistrationId}/orders",
            new { items = new[] { new { productId = product.Entity.ProductId, quantity = 1 } } });
        response.CheckSuccess();

        await CheckOrderCreatedAsync(scope, reg.Entity, product.Entity);
    }

    [Fact]
    public async Task Should_Not_Allow_Admin_To_Create_Order_For_Not_Accessible_Reg()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var admin = await scope.CreateUserAsync(role: Roles.Admin);
        using var org = await scope.CreateOrganizationAsync();
        using var e = await scope.CreateEventAsync(organization: org.Entity);
        using var reg = await scope.CreateRegistrationAsync(e.Entity, user.Entity);

        var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
        var response = await client.PostAsync(
            $"/v3/registrations/{reg.Entity.RegistrationId}/orders?orgId={org.Entity.OrganizationId}",
            new { items = new[] { new { productId = 1, productVariantId = 2, quantity = 3 } } });
        response.CheckForbidden();
    }

    [Fact]
    public async Task Should_Allow_Admin_To_Create_Order_For_Accessible_Reg()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var admin = await scope.CreateUserAsync(role: Roles.Admin);
        using var org = await scope.CreateOrganizationAsync();
        using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
        using var e =
            await scope.CreateEventAsync(organization: org.Entity, organizationId: org.Entity.OrganizationId);
        using var reg = await scope.CreateRegistrationAsync(e.Entity, user.Entity);
        using var product = await scope.CreateProductAsync(e.Entity);

        var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
        var response = await client.PostAsync(
            $"/v3/registrations/{reg.Entity.RegistrationId}/orders?orgId={org.Entity.OrganizationId}",
            new { items = new[] { new { productId = product.Entity.ProductId, quantity = 1 } } });
        response.CheckSuccess();

        await CheckOrderCreatedAsync(scope, reg.Entity, product.Entity);
    }

    [Theory]
    [InlineData(Roles.SuperAdmin)]
    [InlineData(Roles.SystemAdmin)]
    public async Task Should_Allow_Power_Admin_To_Create_Order_For_Any_Reg(string role)
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var e = await scope.CreateEventAsync();
        using var product = await scope.CreateProductAsync(e.Entity);
        using var reg = await scope.CreateRegistrationAsync(e.Entity, user.Entity);

        var client = _factory.CreateClient().Authenticated(role: role);
        var response = await client.PostAsync($"/v3/registrations/{reg.Entity.RegistrationId}/orders",
            new { items = new[] { new { productId = product.Entity.ProductId, quantity = 1 } } });
        response.CheckSuccess();

        await CheckOrderCreatedAsync(scope, reg.Entity, product.Entity);
    }

    [Fact]
    public async Task Should_Not_Allow_To_Include_Product_From_Other_Event_Having_Event_Only_Visibility()
    {
        using var scope = _factory.Services.NewTestScope();
        using var c = await scope.CreateEventCollectionAsync();
        using var user = await scope.CreateUserAsync();
        using var e1 = await scope.CreateEventAsync(collection: c.Entity);
        using var e2 = await scope.CreateEventAsync(collection: c.Entity);
        using var p1 = await scope.CreateProductAsync(e1.Entity, visibility: ProductVisibility.Event);
        using var p2 = await scope.CreateProductAsync(e2.Entity, visibility: ProductVisibility.Event);
        using var reg = await scope.CreateRegistrationAsync(e1.Entity, user.Entity);

        var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
        var response = await client.PostAsync($"/v3/registrations/{reg.Entity.RegistrationId}/orders",
            new { items = new[] { new { productId = p2.Entity.ProductId, quantity = 1 } } });
        response.CheckBadRequest();
    }

    [Fact]
    public async Task Should_Not_Allow_To_Include_Product_From_Other_Collection_Having_Collection_Visibility()
    {
        using var scope = _factory.Services.NewTestScope();
        using var c1 = await scope.CreateEventCollectionAsync();
        using var c2 = await scope.CreateEventCollectionAsync();
        using var user = await scope.CreateUserAsync();
        using var e1 = await scope.CreateEventAsync(collection: c1.Entity);
        using var e2 = await scope.CreateEventAsync(collection: c2.Entity);
        using var p1 = await scope.CreateProductAsync(e1.Entity, visibility: ProductVisibility.Collection);
        using var p2 = await scope.CreateProductAsync(e2.Entity, visibility: ProductVisibility.Collection);
        using var reg = await scope.CreateRegistrationAsync(e1.Entity, user.Entity);

        var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
        var response = await client.PostAsync($"/v3/registrations/{reg.Entity.RegistrationId}/orders",
            new { items = new[] { new { productId = p2.Entity.ProductId, quantity = 1 } } });
        response.CheckBadRequest();
    }

    [Fact]
    public async Task Should_Allow_To_Include_Product_From_Other_Event_Having_Collection_Visibility()
    {
        using var scope = _factory.Services.NewTestScope();
        using var c = await scope.CreateEventCollectionAsync();
        using var user = await scope.CreateUserAsync();
        using var e1 = await scope.CreateEventAsync(collection: c.Entity);
        using var reg = await scope.CreateRegistrationAsync(e1.Entity, user.Entity);
        using var e2 = await scope.CreateEventAsync(collection: c.Entity);
        using var p2 = await scope.CreateProductAsync(e2.Entity, visibility: ProductVisibility.Collection);

        var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
        var response = await client.PostAsync($"/v3/registrations/{reg.Entity.RegistrationId}/orders",
            new { items = new[] { new { productId = p2.Entity.ProductId, quantity = 1 } } });
        response.CheckSuccess();

        await CheckOrderCreatedAsync(scope, reg.Entity, p2.Entity);
    }

    #endregion

    #region List

    [Fact]
    public async Task Should_Require_Auth_To_List_Orders_For_Registration()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/v3/registrations/1/orders");
        response.CheckUnauthorized();
    }

    [Fact]
    public async Task Should_Return_NotFound_When_Listing_Orders_For_Non_Existing_Registration()
    {
        var randomId = Random.Shared.Next(1000000, int.MaxValue);

        var client = _factory.CreateClient().Authenticated();
        var response = await client.GetAsync($"/v3/registrations/{randomId}/orders");
        response.CheckNotFound();
    }

    [Fact]
    public async Task Should_Not_Allow_Regular_User_To_List_Someone_Elses_Orders()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var e = await scope.CreateEventAsync();
        using var reg = await scope.CreateRegistrationAsync(e.Entity, user.Entity);

        var client = _factory.CreateClient().Authenticated();

        var response = await client.GetAsync($"/v3/registrations/{reg.Entity.RegistrationId}/orders");
        response.CheckForbidden();
    }

    [Fact]
    public async Task Should_Not_Allow_Admin_To_List_Orders_For_Not_Accessible_Reg()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var admin = await scope.CreateUserAsync(role: Roles.Admin);
        using var org = await scope.CreateOrganizationAsync();
        using var e = await scope.CreateEventAsync(organization: org.Entity);
        using var reg = await scope.CreateRegistrationAsync(e.Entity, user.Entity);

        var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
        var response =
            await client.GetAsync(
                $"/v3/registrations/{reg.Entity.RegistrationId}/orders?orgId={org.Entity.OrganizationId}");
        response.CheckForbidden();
    }

    [Fact]
    public async Task Should_Allow_Admin_To_List_Orders_For_Accessible_Reg()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var admin = await scope.CreateUserAsync(role: Roles.Admin);
        using var org = await scope.CreateOrganizationAsync();
        using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
        using var e =
            await scope.CreateEventAsync(organization: org.Entity, organizationId: org.Entity.OrganizationId);
        using var reg = await scope.CreateRegistrationAsync(e.Entity, user.Entity);
        using var product = await scope.CreateProductAsync(e.Entity);
        using var v1 = await scope.CreateProductVariantAsync(product.Entity);
        using var v2 = await scope.CreateProductVariantAsync(product.Entity);
        using var o1 = await scope.CreateOrderAsync(reg.Entity, product.Entity, v1.Entity);
        using var o2 = await scope.CreateOrderAsync(reg.Entity, product.Entity, v2.Entity);

        var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
        var response =
            await client.GetAsync(
                $"/v3/registrations/{reg.Entity.RegistrationId}/orders?orgId={org.Entity.OrganizationId}");
        response.CheckOk();

        var token = await response.AsArrayAsync();
        token.CheckArray((t, o) => t.CheckRegistrationOrder(o),
            o1.Entity, o2.Entity);
    }

    [Theory]
    [InlineData(Roles.SuperAdmin)]
    [InlineData(Roles.SystemAdmin)]
    public async Task Should_Allow_Power_Admin_To_List_Orders_For_Any_Reg(string role)
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var e = await scope.CreateEventAsync();
        using var product = await scope.CreateProductAsync(e.Entity);
        using var reg = await scope.CreateRegistrationAsync(e.Entity, user.Entity);
        using var v1 = await scope.CreateProductVariantAsync(product.Entity);
        using var v2 = await scope.CreateProductVariantAsync(product.Entity);
        using var o1 = await scope.CreateOrderAsync(reg.Entity, product.Entity, v1.Entity);
        using var o2 = await scope.CreateOrderAsync(reg.Entity, product.Entity, v2.Entity);

        var client = _factory.CreateClient().Authenticated(role: role);
        var response = await client.GetAsync($"/v3/registrations/{reg.Entity.RegistrationId}/orders");
        response.CheckOk();

        var token = await response.AsArrayAsync();
        token.CheckArray((t, o) => t.CheckRegistrationOrder(o),
            o1.Entity, o2.Entity);
    }

    #endregion

    #region AutoCreateOrUpdate

    [Fact]
    public async Task AutoCreateOrUpdate_Should_ReturnNotFound_When_RegistrationNotFound()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var ev = await scope.CreateEventAsync();
        using var reg = await scope.CreateRegistrationAsync(ev.Entity, user.Entity);
        using var prod = await scope.CreateProductAsync(ev.Entity);

        var client = _factory.CreateClient().AuthenticatedAs(user.Entity);
        var wrongId = reg.Entity.RegistrationId + Random.Shared.Next(1, 100);
        var response = await client.PostAsync($"/v3/registrations/{wrongId}/products",
            new OrderUpdateRequestDto { Lines = new[] { new OrderLineModel(prod.Entity.ProductId, null, 1) } });

        response.CheckNotFound();

        Assert.Empty(scope.Db.Orders.Where(o => o.RegistrationId == reg.Entity.RegistrationId));
    }

    [Fact]
    public async Task AutoCreateOrUpdate_Should_CreateNewOrder_When_ThereAreNoOrders()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var ev = await scope.CreateEventAsync();
        using var reg = await scope.CreateRegistrationAsync(ev.Entity, user.Entity);
        using var prod = await scope.CreateProductAsync(ev.Entity);

        var client = _factory.CreateClient().AuthenticatedAs(user.Entity);
        var response = await client.PostAsync($"/v3/registrations/{reg.Entity.RegistrationId}/products",
            new OrderUpdateRequestDto { Lines = new[] { new OrderLineModel(prod.Entity.ProductId, null, 1) } });

        response.CheckOk();

        await CheckOrderCreatedAsync(scope, reg.Entity, prod.Entity);
    }

    [Fact]
    public async Task AutoCreateOrUpdate_Should_CreateOrder_If_ThereAreNoEditableOrders()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var ev = await scope.CreateEventAsync();
        using var reg = await scope.CreateRegistrationAsync(ev.Entity, user.Entity);
        using var prod = await scope.CreateProductAsync(ev.Entity);
        using var order = await scope.CreateOrderAsync(reg.Entity, status: Order.OrderStatus.Invoiced);

        var client = _factory.CreateClient().AuthenticatedAs(user.Entity);
        var response = await client.PostAsync($"/v3/registrations/{reg.Entity.RegistrationId}/products",
            new OrderUpdateRequestDto { Lines = new[] { new OrderLineModel(prod.Entity.ProductId, null, 1) } });

        response.CheckOk();

        Assert.Equal(2, scope.Db.Orders.Count(o => o.RegistrationId == reg.Entity.RegistrationId));
    }

    [Fact]
    public async Task AutoCreateOrUpdate_Should_UpdateOrder_If_ThereAreEditableOrders()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var ev = await scope.CreateEventAsync();
        using var reg = await scope.CreateRegistrationAsync(ev.Entity, user.Entity);
        using var prod = await scope.CreateProductAsync(ev.Entity);
        using var order = await scope.CreateOrderAsync(reg.Entity);

        var client = _factory.CreateClient().AuthenticatedAs(user.Entity);
        var response = await client.PostAsync($"/v3/registrations/{reg.Entity.RegistrationId}/products",
            new OrderUpdateRequestDto { Lines = new[] { new OrderLineModel(prod.Entity.ProductId, null, 1) } });

        response.CheckOk();

        await CheckOrderCreatedAsync(scope, reg.Entity, prod.Entity);
        Assert.Single(scope.Db.Orders.Where(o => o.RegistrationId == reg.Entity.RegistrationId));
    }

    [Fact]
    public async Task AutoCreateOrUpdate_Should_ReturnBadRequest_If_DataHasNegativeQuantity()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var ev = await scope.CreateEventAsync();
        using var reg = await scope.CreateRegistrationAsync(ev.Entity, user.Entity);
        using var prod = await scope.CreateProductAsync(ev.Entity);

        var client = _factory.CreateClient().AuthenticatedAs(user.Entity);
        var response = await client.PostAsync($"/v3/registrations/{reg.Entity.RegistrationId}/products",
            new OrderUpdateRequestDto { Lines = new[] { new OrderLineModel(prod.Entity.ProductId, null, -1) } });

        response.CheckBadRequest();
        Assert.Empty(scope.Db.Orders.Where(o => o.RegistrationId == reg.Entity.RegistrationId));
    }

    [Fact]
    public async Task AutoCreateOrUpdate_Should_CreateOrderToApplyDifference()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var ev = await scope.CreateEventAsync();
        using var reg = await scope.CreateRegistrationAsync(ev.Entity, user.Entity);
        using var prodToRemove = await scope.CreateProductAsync(ev.Entity, minimumQuantity: 0);
        using var prodToUpdateReduceQuantity = await scope.CreateProductAsync(ev.Entity);
        using var prodToUpdateAddQuantity = await scope.CreateProductAsync(ev.Entity);
        using var prodToAdd = await scope.CreateProductAsync(ev.Entity, minimumQuantity: 0);
        using var order = await scope.CreateOrderAsync(reg.Entity,
            new[] { prodToRemove.Entity, prodToUpdateReduceQuantity.Entity, prodToUpdateAddQuantity.Entity },
            null,
            new[] { 1, 3, 1 });
        var client = _factory.CreateClient().AuthenticatedAs(user.Entity);

        var lines = new[]
        {
            new OrderLineModel(prodToUpdateReduceQuantity.Entity.ProductId, null, 2),
            new OrderLineModel(prodToUpdateAddQuantity.Entity.ProductId, null, 2),
            new OrderLineModel(prodToAdd.Entity.ProductId, null, 2)
        };

        var response = await client.PostAsync($"/v3/registrations/{reg.Entity.RegistrationId}/products",
            new OrderUpdateRequestDto { Lines = lines });

        response.CheckOk();
        Assert.Single(scope.Db.Orders.Where(o => o.RegistrationId == reg.Entity.RegistrationId));

        using var newScope = _factory.Services.CreateScope();
        CheckRegistrationOrderedProducts(newScope, reg.Entity.RegistrationId, lines);
    }

    #endregion
}
