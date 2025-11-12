using System.Diagnostics;
using System.Linq;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.TestAbstractions;
using Eventuras.WebApi.Controllers.v3.Registrations;
using Eventuras.WebApi.Models;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Registrations;

/// <summary>
///     Integration tests for registration products functionality through the API.
///     These tests verify the HTTP endpoints work correctly end-to-end.
///     Detailed business logic tests are in RegistrationProductsServiceTests.
/// </summary>
public class RegistrationProductsControllerTest : IClassFixture<CustomWebApiApplicationFactory<Program>>
{
    // JSON options matching the API's configuration (enums as strings)
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true, Converters = { new JsonStringEnumConverter() }
    };

    private readonly CustomWebApiApplicationFactory<Program> _factory;

    public RegistrationProductsControllerTest(CustomWebApiApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task GetRegistration_WithIncludeProducts_ShouldReturnAggregatedProducts()
    {
        // Arrange
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var user = await scope.CreateUserAsync();
        using var product1 = await scope.CreateProductAsync(evt.Entity, "Conference Ticket", price: 1000);
        using var product2 = await scope.CreateProductAsync(evt.Entity, "Workshop", price: 500);

        using var registration = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
        using var order = await scope.CreateOrderAsync(registration.Entity, user: user.Entity);

        // Add order lines manually
        scope.Db.OrderLines.Add(new OrderLine
        {
            OrderId = order.Entity.OrderId, ProductId = product1.Entity.ProductId, Quantity = 2, Price = 1000
        });
        scope.Db.OrderLines.Add(new OrderLine
        {
            OrderId = order.Entity.OrderId, ProductId = product2.Entity.ProductId, Quantity = 3, Price = 500
        });
        await scope.Db.SaveChangesAsync();

        var client = _factory.CreateClient().AuthenticatedAs(user.Entity);

        // Act
        var response =
            await client.GetAsync($"/v3/registrations/{registration.Entity.RegistrationId}?includeProducts=true");

        // Assert
        response.CheckOk();
        var dto = await response.Content.ReadFromJsonAsync<RegistrationDto>(JsonOptions);
        Assert.NotNull(dto);
        Assert.NotNull(dto.Products);

        var products = dto.Products.ToList();
        Assert.Equal(2, products.Count);

        var ticket = products.FirstOrDefault(p => p.ProductId == product1.Entity.ProductId);
        Assert.NotNull(ticket);
        Assert.Equal(2, ticket.Quantity);
        Assert.Equal("Conference Ticket", ticket.Product.Name);

        var workshop = products.FirstOrDefault(p => p.ProductId == product2.Entity.ProductId);
        Assert.NotNull(workshop);
        Assert.Equal(3, workshop.Quantity);
        Assert.Equal("Workshop", workshop.Product.Name);
    }

    [Fact]
    public async Task GetRegistration_WithoutIncludeProducts_ShouldNotReturnProducts()
    {
        // Arrange
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var user = await scope.CreateUserAsync();
        using var product = await scope.CreateProductAsync(evt.Entity, "Ticket", price: 1000);

        using var registration = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
        using var order = await scope.CreateOrderAsync(registration.Entity, user: user.Entity);

        scope.Db.OrderLines.Add(new OrderLine
        {
            OrderId = order.Entity.OrderId, ProductId = product.Entity.ProductId, Quantity = 1, Price = 1000
        });
        await scope.Db.SaveChangesAsync();

        var client = _factory.CreateClient().AuthenticatedAs(user.Entity);

        // Act - Note: no includeProducts parameter
        var response = await client.GetAsync($"/v3/registrations/{registration.Entity.RegistrationId}");

        // Assert
        response.CheckOk();
        var dto = await response.Content.ReadFromJsonAsync<RegistrationDto>(JsonOptions);
        Assert.NotNull(dto);
        Assert.Null(dto.Products);
    }

    [Fact]
    public async Task GetRegistration_WithMultipleOrders_ShouldAggregateQuantities()
    {
        // Arrange - Tests that multiple orders are summed correctly
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var user = await scope.CreateUserAsync();
        using var product = await scope.CreateProductAsync(evt.Entity, "Daily Rate", price: 200);

        using var registration = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);

        // First order: 2 items
        using var order1 = await scope.CreateOrderAsync(registration.Entity, user: user.Entity);
        scope.Db.OrderLines.Add(new OrderLine
        {
            OrderId = order1.Entity.OrderId, ProductId = product.Entity.ProductId, Quantity = 2, Price = 200
        });

        // Second order: 3 items
        using var order2 = await scope.CreateOrderAsync(registration.Entity, user: user.Entity);
        scope.Db.OrderLines.Add(new OrderLine
        {
            OrderId = order2.Entity.OrderId, ProductId = product.Entity.ProductId, Quantity = 3, Price = 200
        });

        await scope.Db.SaveChangesAsync();

        var client = _factory.CreateClient().AuthenticatedAs(user.Entity);

        // Act
        var response =
            await client.GetAsync($"/v3/registrations/{registration.Entity.RegistrationId}?includeProducts=true");

        // Assert
        response.CheckOk();
        var dto = await response.Content.ReadFromJsonAsync<RegistrationDto>(JsonOptions);
        Assert.NotNull(dto);
        Assert.NotNull(dto.Products);

        var products = dto.Products.ToList();
        Assert.Single(products);
        Assert.Equal(5, products[0].Quantity); // 2 + 3
    }

    [Fact]
    public async Task GetRegistration_WithProductVariants_ShouldReturnSeparateLines()
    {
        // Arrange
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var user = await scope.CreateUserAsync();
        using var product = await scope.CreateProductAsync(evt.Entity, "T-Shirt", price: 200);
        using var variantSmall = await scope.CreateProductVariantAsync(product.Entity, "Small", price: 200);
        using var variantLarge = await scope.CreateProductVariantAsync(product.Entity, "Large", price: 250);

        using var registration = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
        using var order = await scope.CreateOrderAsync(registration.Entity, user: user.Entity);

        scope.Db.OrderLines.Add(new OrderLine
        {
            OrderId = order.Entity.OrderId,
            ProductId = product.Entity.ProductId,
            ProductVariantId = variantSmall.Entity.ProductVariantId,
            Quantity = 2,
            Price = 200
        });
        scope.Db.OrderLines.Add(new OrderLine
        {
            OrderId = order.Entity.OrderId,
            ProductId = product.Entity.ProductId,
            ProductVariantId = variantLarge.Entity.ProductVariantId,
            Quantity = 1,
            Price = 250
        });
        await scope.Db.SaveChangesAsync();

        var client = _factory.CreateClient().AuthenticatedAs(user.Entity);

        // Act
        var response =
            await client.GetAsync($"/v3/registrations/{registration.Entity.RegistrationId}?includeProducts=true");

        // Assert
        response.CheckOk();
        var dto = await response.Content.ReadFromJsonAsync<RegistrationDto>(JsonOptions);
        Assert.NotNull(dto);
        Assert.NotNull(dto.Products);

        var products = dto.Products.ToList();
        Assert.Equal(2, products.Count);

        var small = products.FirstOrDefault(p => p.ProductVariantId == variantSmall.Entity.ProductVariantId);
        Assert.NotNull(small);
        Assert.Equal(2, small.Quantity);
        Assert.Equal("Small", small.ProductVariant?.Name);

        var large = products.FirstOrDefault(p => p.ProductVariantId == variantLarge.Entity.ProductVariantId);
        Assert.NotNull(large);
        Assert.Equal(1, large.Quantity);
        Assert.Equal("Large", large.ProductVariant?.Name);
    }

    [Fact]
    public async Task GetRegistration_WithRefundedProducts_ShouldCalculateNetQuantity()
    {
        // Arrange - Simulates the real-world scenario of adding then partially refunding
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var user = await scope.CreateUserAsync();
        using var product = await scope.CreateProductAsync(evt.Entity, "Conference Ticket", price: 1000);

        using var registration = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);

        // Initial order: 5 tickets
        using var order1 = await scope.CreateOrderAsync(registration.Entity, user: user.Entity);
        order1.Entity.Status = Order.OrderStatus.Verified;
        scope.Db.OrderLines.Add(new OrderLine
        {
            OrderId = order1.Entity.OrderId, ProductId = product.Entity.ProductId, Quantity = 5, Price = 1000
        });

        // Refund order: -2 tickets
        using var order2 = await scope.CreateOrderAsync(registration.Entity, user: user.Entity);
        scope.Db.OrderLines.Add(new OrderLine
        {
            OrderId = order2.Entity.OrderId, ProductId = product.Entity.ProductId, Quantity = -2, Price = 1000
        });

        await scope.Db.SaveChangesAsync();

        var client = _factory.CreateClient().AuthenticatedAs(user.Entity);

        // Act
        var response =
            await client.GetAsync($"/v3/registrations/{registration.Entity.RegistrationId}?includeProducts=true");

        // Assert
        response.CheckOk();
        var dto = await response.Content.ReadFromJsonAsync<RegistrationDto>(JsonOptions);
        Assert.NotNull(dto);
        Assert.NotNull(dto.Products);

        var products = dto.Products.ToList();
        Assert.Single(products);
        Assert.Equal(3, products[0].Quantity); // Net: 5 - 2 = 3
    }

    [Fact]
    public async Task GetRegistrations_WithIncludeProducts_ShouldReturnProductsForAllRegistrations()
    {
        // Arrange - Tests the list endpoint includes products
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var user1 = await scope.CreateUserAsync(email: "user1@test.com");
        using var user2 = await scope.CreateUserAsync(email: "user2@test.com");
        using var product1 = await scope.CreateProductAsync(evt.Entity, "Ticket", price: 1000);
        using var product2 = await scope.CreateProductAsync(evt.Entity, "Workshop", price: 500);

        // Registration 1
        using var registration1 = await scope.CreateRegistrationAsync(evt.Entity, user1.Entity);
        using var order1 = await scope.CreateOrderAsync(registration1.Entity, user: user1.Entity);
        scope.Db.OrderLines.Add(new OrderLine
        {
            OrderId = order1.Entity.OrderId, ProductId = product1.Entity.ProductId, Quantity = 2, Price = 1000
        });

        // Registration 2
        using var registration2 = await scope.CreateRegistrationAsync(evt.Entity, user2.Entity);
        using var order2 = await scope.CreateOrderAsync(registration2.Entity, user: user2.Entity);
        scope.Db.OrderLines.Add(new OrderLine
        {
            OrderId = order2.Entity.OrderId, ProductId = product2.Entity.ProductId, Quantity = 3, Price = 500
        });

        await scope.Db.SaveChangesAsync();

        var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();

        // Act
        var response =
            await client.GetAsync($"/v3/registrations?eventId={evt.Entity.EventInfoId}&includeProducts=true");

        // Assert
        response.CheckOk();
        var pageResponse = await response.Content.ReadFromJsonAsync<PageResponseDto<RegistrationDto>>(JsonOptions);
        Assert.NotNull(pageResponse);
        Assert.Equal(2, pageResponse.Data.Length);

        // Check first registration
        var reg1 = pageResponse.Data.FirstOrDefault(r => r.RegistrationId == registration1.Entity.RegistrationId);
        Assert.NotNull(reg1);
        Assert.NotNull(reg1.Products);
        var reg1Products = reg1.Products.ToList();
        Assert.Single(reg1Products);
        Assert.Equal(product1.Entity.ProductId, reg1Products[0].ProductId);
        Assert.Equal(2, reg1Products[0].Quantity);

        // Check second registration
        var reg2 = pageResponse.Data.FirstOrDefault(r => r.RegistrationId == registration2.Entity.RegistrationId);
        Assert.NotNull(reg2);
        Assert.NotNull(reg2.Products);
        var reg2Products = reg2.Products.ToList();
        Assert.Single(reg2Products);
        Assert.Equal(product2.Entity.ProductId, reg2Products[0].ProductId);
        Assert.Equal(3, reg2Products[0].Quantity);
    }

    [Fact]
    public async Task GetRegistrations_Performance_ShouldHandleMultipleRegistrationsEfficiently()
    {
        // Arrange - Performance test to catch N+1 query issues
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var product1 = await scope.CreateProductAsync(evt.Entity, "Ticket", price: 1000);
        using var product2 = await scope.CreateProductAsync(evt.Entity, "Workshop", price: 500);

        // Create 20 registrations with products (reduced from 50 for faster test execution)
        for (var i = 1; i <= 20; i++)
        {
            var user = await scope.CreateUserAsync(email: $"perftest{i}@test.com");
            var registration = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            var order = await scope.CreateOrderAsync(registration.Entity, user: user.Entity);

            scope.Db.OrderLines.Add(new OrderLine
            {
                OrderId = order.Entity.OrderId, ProductId = product1.Entity.ProductId, Quantity = 1, Price = 1000
            });
            scope.Db.OrderLines.Add(new OrderLine
            {
                OrderId = order.Entity.OrderId, ProductId = product2.Entity.ProductId, Quantity = 2, Price = 500
            });
        }

        await scope.Db.SaveChangesAsync();

        var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response =
            await client.GetAsync($"/v3/registrations?eventId={evt.Entity.EventInfoId}&includeProducts=true&count=50");
        stopwatch.Stop();

        // Assert
        response.CheckOk();
        Assert.True(stopwatch.ElapsedMilliseconds < 5000,
            $"Request took {stopwatch.ElapsedMilliseconds}ms, should be under 5000ms");

        var pageResponse = await response.Content.ReadFromJsonAsync<PageResponseDto<RegistrationDto>>(JsonOptions);
        Assert.NotNull(pageResponse);
        Assert.Equal(20, pageResponse.Data.Length);

        // Verify all have products populated
        Assert.All(pageResponse.Data, reg =>
        {
            Assert.NotNull(reg.Products);
            Assert.Equal(2, reg.Products.Count());
        });
    }

    [Fact]
    public async Task GetRegistration_WithCancelledOrder_ShouldExcludeProducts()
    {
        // Arrange - Cancelled orders should not contribute to product aggregation
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var user = await scope.CreateUserAsync();
        using var product1 = await scope.CreateProductAsync(evt.Entity, "Ticket", price: 1000);
        using var product2 = await scope.CreateProductAsync(evt.Entity, "Workshop", price: 500);

        using var registration = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);

        // Active order
        using var activeOrder = await scope.CreateOrderAsync(registration.Entity, user: user.Entity);
        scope.Db.OrderLines.Add(new OrderLine
        {
            OrderId = activeOrder.Entity.OrderId, ProductId = product1.Entity.ProductId, Quantity = 2, Price = 1000
        });

        // Cancelled order
        using var cancelledOrder = await scope.CreateOrderAsync(registration.Entity, user: user.Entity);
        cancelledOrder.Entity.Status = Order.OrderStatus.Cancelled;
        scope.Db.OrderLines.Add(new OrderLine
        {
            OrderId = cancelledOrder.Entity.OrderId,
            ProductId = product2.Entity.ProductId,
            Quantity = 5,
            Price = 500
        });

        await scope.Db.SaveChangesAsync();

        var client = _factory.CreateClient().AuthenticatedAs(user.Entity);

        // Act
        var response =
            await client.GetAsync($"/v3/registrations/{registration.Entity.RegistrationId}?includeProducts=true");

        // Assert
        response.CheckOk();
        var dto = await response.Content.ReadFromJsonAsync<RegistrationDto>(JsonOptions);
        Assert.NotNull(dto);
        Assert.NotNull(dto.Products);

        var products = dto.Products.ToList();
        Assert.Single(products);
        Assert.Equal(product1.Entity.ProductId, products[0].ProductId);
        Assert.Equal(2, products[0].Quantity);
    }

    [Fact]
    public async Task GetRegistration_RequiresAuthentication()
    {
        // Arrange
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var user = await scope.CreateUserAsync();
        using var registration = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);

        var client = _factory.CreateClient(); // Not authenticated

        // Act
        var response =
            await client.GetAsync($"/v3/registrations/{registration.Entity.RegistrationId}?includeProducts=true");

        // Assert
        response.CheckUnauthorized();
    }

    [Fact]
    public async Task GetRegistration_RequiresOwnershipOrAdminRole()
    {
        // Arrange
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var owner = await scope.CreateUserAsync(email: "owner@test.com");
        using var otherUser = await scope.CreateUserAsync(email: "other@test.com");
        using var registration = await scope.CreateRegistrationAsync(evt.Entity, owner.Entity);

        var client = _factory.CreateClient().AuthenticatedAs(otherUser.Entity);

        // Act
        var response =
            await client.GetAsync($"/v3/registrations/{registration.Entity.RegistrationId}?includeProducts=true");

        // Assert
        response.CheckForbidden();
    }
}
