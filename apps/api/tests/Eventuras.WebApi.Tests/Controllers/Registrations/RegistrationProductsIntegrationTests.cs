#nullable enable

using System;
using System.Linq;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.WebApi.Controllers.v3.Registrations;
using Eventuras.WebApi.Models;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Registrations;

public class RegistrationProductsIntegrationTests : IClassFixture<CustomWebApplicationFactory<Program>>, IAsyncLifetime
{
    private readonly CustomWebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private Organization _org = null!;
    private EventInfo _event = null!;
    private ApplicationUser _user = null!;
    private Product _product1 = null!;
    private Product _product2 = null!;
    private Product _productWithVariants = null!;
    private ProductVariant _variantSmall = null!;
    private ProductVariant _variantLarge = null!;

    public RegistrationProductsIntegrationTests(CustomWebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    public async Task InitializeAsync()
    {
        // Setup organization, event, user and products
        await _factory.UseSystemAdminAsync();

        _org = await _factory.CreateOrganizationAsync();
        _event = await _factory.CreateEventAsync(organizationId: _org.OrganizationId);
        _user = await _factory.CreateUserAsync();

        // Product without variants
        _product1 = await _factory.CreateProductAsync(_event.EventInfoId, name: "Conference Ticket", price: 1000);
        _product2 = await _factory.CreateProductAsync(_event.EventInfoId, name: "Workshop", price: 500);

        // Product with variants
        _productWithVariants = await _factory.CreateProductAsync(_event.EventInfoId, name: "T-Shirt", price: 200);
        _variantSmall = await _factory.CreateProductVariantAsync(_productWithVariants.ProductId, name: "Small", price: 200);
        _variantLarge = await _factory.CreateProductVariantAsync(_productWithVariants.ProductId, name: "Large", price: 250);
    }

    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task GetRegistration_WithSimpleProducts_ShouldReturnAggregatedProducts()
    {
        // Arrange
        var registration = await _factory.CreateRegistrationAsync(_event.EventInfoId, _user.Id);
        var order = await _factory.CreateOrderAsync(registration.RegistrationId, new[]
        {
            (_product1.ProductId, (int?)null, 1),
            (_product2.ProductId, (int?)null, 2)
        });

        // Act
        var response = await _client.GetAsync($"/v3/registrations/{registration.RegistrationId}?includeProducts=true");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var dto = await response.Content.ReadFromJsonAsync<RegistrationDto>();
        Assert.NotNull(dto);
        Assert.NotNull(dto.Products);

        var products = dto.Products.ToList();
        Assert.Equal(2, products.Count);

        var product1Result = products.FirstOrDefault(p => p.ProductId == _product1.ProductId);
        Assert.NotNull(product1Result);
        Assert.Equal(1, product1Result.Quantity);
        Assert.Equal("Conference Ticket", product1Result.Product.Name);

        var product2Result = products.FirstOrDefault(p => p.ProductId == _product2.ProductId);
        Assert.NotNull(product2Result);
        Assert.Equal(2, product2Result.Quantity);
        Assert.Equal("Workshop", product2Result.Product.Name);
    }

    [Fact]
    public async Task GetRegistration_WithProductVariants_ShouldGroupByVariant()
    {
        // Arrange
        var registration = await _factory.CreateRegistrationAsync(_event.EventInfoId, _user.Id);
        var order = await _factory.CreateOrderAsync(registration.RegistrationId, new[]
        {
            (_productWithVariants.ProductId, (int?)_variantSmall.ProductVariantId, 2),
            (_productWithVariants.ProductId, (int?)_variantLarge.ProductVariantId, 1)
        });

        // Act
        var response = await _client.GetAsync($"/v3/registrations/{registration.RegistrationId}?includeProducts=true");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var dto = await response.Content.ReadFromJsonAsync<RegistrationDto>();
        Assert.NotNull(dto);
        Assert.NotNull(dto.Products);

        var products = dto.Products.ToList();
        Assert.Equal(2, products.Count); // Two separate lines for two variants

        var smallVariant = products.FirstOrDefault(p => p.ProductVariantId == _variantSmall.ProductVariantId);
        Assert.NotNull(smallVariant);
        Assert.Equal(2, smallVariant.Quantity);
        Assert.Equal("Small", smallVariant.ProductVariant?.Name);

        var largeVariant = products.FirstOrDefault(p => p.ProductVariantId == _variantLarge.ProductVariantId);
        Assert.NotNull(largeVariant);
        Assert.Equal(1, largeVariant.Quantity);
        Assert.Equal("Large", largeVariant.ProductVariant?.Name);
    }

    [Fact]
    public async Task GetRegistration_WithMultipleOrders_ShouldSumQuantities()
    {
        // Arrange
        var registration = await _factory.CreateRegistrationAsync(_event.EventInfoId, _user.Id);

        // First order: 2 tickets
        var order1 = await _factory.CreateOrderAsync(registration.RegistrationId, new[]
        {
            (_product1.ProductId, (int?)null, 2)
        });
        await _factory.SetOrderStatusAsync(order1.OrderId, Order.OrderStatus.Verified);

        // Second order: 3 more tickets
        var order2 = await _factory.CreateOrderAsync(registration.RegistrationId, new[]
        {
            (_product1.ProductId, (int?)null, 3)
        });

        // Act
        var response = await _client.GetAsync($"/v3/registrations/{registration.RegistrationId}?includeProducts=true");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var dto = await response.Content.ReadFromJsonAsync<RegistrationDto>();
        Assert.NotNull(dto);
        Assert.NotNull(dto.Products);

        var products = dto.Products.ToList();
        Assert.Single(products); // Only one product line
        Assert.Equal(5, products[0].Quantity); // Sum of 2 + 3
    }

    [Fact]
    public async Task GetRegistration_WithCancelledOrders_ShouldExcludeFromProducts()
    {
        // Arrange
        var registration = await _factory.CreateRegistrationAsync(_event.EventInfoId, _user.Id);

        // Active order
        var activeOrder = await _factory.CreateOrderAsync(registration.RegistrationId, new[]
        {
            (_product1.ProductId, (int?)null, 2)
        });

        // Cancelled order
        var cancelledOrder = await _factory.CreateOrderAsync(registration.RegistrationId, new[]
        {
            (_product2.ProductId, (int?)null, 5)
        });
        await _factory.SetOrderStatusAsync(cancelledOrder.OrderId, Order.OrderStatus.Cancelled);

        // Act
        var response = await _client.GetAsync($"/v3/registrations/{registration.RegistrationId}?includeProducts=true");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var dto = await response.Content.ReadFromJsonAsync<RegistrationDto>();
        Assert.NotNull(dto);
        Assert.NotNull(dto.Products);

        var products = dto.Products.ToList();
        Assert.Single(products); // Only active order
        Assert.Equal(_product1.ProductId, products[0].ProductId);
        Assert.Equal(2, products[0].Quantity);
    }

    [Fact]
    public async Task GetRegistration_WithRefunds_ShouldCalculateNetQuantity()
    {
        // Arrange
        var registration = await _factory.CreateRegistrationAsync(_event.EventInfoId, _user.Id);

        // Initial order: 5 items
        var order1 = await _factory.CreateOrderAsync(registration.RegistrationId, new[]
        {
            (_product1.ProductId, (int?)null, 5)
        });
        await _factory.SetOrderStatusAsync(order1.OrderId, Order.OrderStatus.Invoiced);

        // Refund order: -2 items
        var refundOrder = await _factory.CreateOrderAsync(registration.RegistrationId, new[]
        {
            (_product1.ProductId, (int?)null, -2)
        });

        // Act
        var response = await _client.GetAsync($"/v3/registrations/{registration.RegistrationId}?includeProducts=true");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var dto = await response.Content.ReadFromJsonAsync<RegistrationDto>();
        Assert.NotNull(dto);
        Assert.NotNull(dto.Products);

        var products = dto.Products.ToList();
        Assert.Single(products);
        Assert.Equal(3, products[0].Quantity); // Net: 5 - 2 = 3
    }

    [Fact]
    public async Task GetRegistration_WithZeroNetQuantity_ShouldExcludeProduct()
    {
        // Arrange
        var registration = await _factory.CreateRegistrationAsync(_event.EventInfoId, _user.Id);

        // Order: 3 items
        var order1 = await _factory.CreateOrderAsync(registration.RegistrationId, new[]
        {
            (_product1.ProductId, (int?)null, 3)
        });
        await _factory.SetOrderStatusAsync(order1.OrderId, Order.OrderStatus.Invoiced);

        // Full refund: -3 items
        var refundOrder = await _factory.CreateOrderAsync(registration.RegistrationId, new[]
        {
            (_product1.ProductId, (int?)null, -3)
        });

        // Act
        var response = await _client.GetAsync($"/v3/registrations/{registration.RegistrationId}?includeProducts=true");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var dto = await response.Content.ReadFromJsonAsync<RegistrationDto>();
        Assert.NotNull(dto);
        Assert.NotNull(dto.Products);

        var products = dto.Products.ToList();
        Assert.Empty(products); // Net zero should be excluded
    }

    [Fact]
    public async Task GetRegistration_WithoutIncludeProducts_ShouldNotReturnProducts()
    {
        // Arrange
        var registration = await _factory.CreateRegistrationAsync(_event.EventInfoId, _user.Id);
        var order = await _factory.CreateOrderAsync(registration.RegistrationId, new[]
        {
            (_product1.ProductId, (int?)null, 1)
        });

        // Act - Note: no includeProducts parameter
        var response = await _client.GetAsync($"/v3/registrations/{registration.RegistrationId}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var dto = await response.Content.ReadFromJsonAsync<RegistrationDto>();
        Assert.NotNull(dto);
        Assert.Null(dto.Products); // Should not be populated
    }

    [Fact]
    public async Task GetRegistrations_WithIncludeProducts_ShouldReturnProductsForAll()
    {
        // Arrange - Create multiple registrations with products
        var registration1 = await _factory.CreateRegistrationAsync(_event.EventInfoId, _user.Id);
        await _factory.CreateOrderAsync(registration1.RegistrationId, new[]
        {
            (_product1.ProductId, (int?)null, 2)
        });

        var user2 = await _factory.CreateUserAsync(email: "user2@test.com");
        var registration2 = await _factory.CreateRegistrationAsync(_event.EventInfoId, user2.Id);
        await _factory.CreateOrderAsync(registration2.RegistrationId, new[]
        {
            (_product2.ProductId, (int?)null, 3)
        });

        // Act
        var response = await _client.GetAsync($"/v3/registrations?eventId={_event.EventInfoId}&includeProducts=true");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var pageResponse = await response.Content.ReadFromJsonAsync<PageResponseDto<RegistrationDto>>();
        Assert.NotNull(pageResponse);
        Assert.Equal(2, pageResponse.Data.Length);

        // Check first registration
        var reg1 = pageResponse.Data.FirstOrDefault(r => r.RegistrationId == registration1.RegistrationId);
        Assert.NotNull(reg1);
        Assert.NotNull(reg1.Products);
        var reg1Products = reg1.Products.ToList();
        Assert.Single(reg1Products);
        Assert.Equal(_product1.ProductId, reg1Products[0].ProductId);
        Assert.Equal(2, reg1Products[0].Quantity);

        // Check second registration
        var reg2 = pageResponse.Data.FirstOrDefault(r => r.RegistrationId == registration2.RegistrationId);
        Assert.NotNull(reg2);
        Assert.NotNull(reg2.Products);
        var reg2Products = reg2.Products.ToList();
        Assert.Single(reg2Products);
        Assert.Equal(_product2.ProductId, reg2Products[0].ProductId);
        Assert.Equal(3, reg2Products[0].Quantity);
    }

    [Fact]
    public async Task GetRegistrations_Performance_ShouldHandleMultipleRegistrations()
    {
        // Arrange - Create many registrations with products
        var users = await Task.WhenAll(Enumerable.Range(1, 50)
            .Select(i => _factory.CreateUserAsync(email: $"perftest{i}@test.com")));

        foreach (var user in users)
        {
            var registration = await _factory.CreateRegistrationAsync(_event.EventInfoId, user.Id);
            await _factory.CreateOrderAsync(registration.RegistrationId, new[]
            {
                (_product1.ProductId, (int?)null, 1),
                (_product2.ProductId, (int?)null, 2)
            });
        }

        // Act
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        var response = await _client.GetAsync($"/v3/registrations?eventId={_event.EventInfoId}&includeProducts=true&count=100");
        stopwatch.Stop();

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(stopwatch.ElapsedMilliseconds < 5000,
            $"Request took {stopwatch.ElapsedMilliseconds}ms, should be under 5000ms");

        var pageResponse = await response.Content.ReadFromJsonAsync<PageResponseDto<RegistrationDto>>();
        Assert.NotNull(pageResponse);
        Assert.True(pageResponse.Data.Length >= 50);

        // Verify all have products
        Assert.All(pageResponse.Data, reg =>
        {
            Assert.NotNull(reg.Products);
            Assert.True(reg.Products.Any());
        });
    }
}
