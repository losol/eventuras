using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Registrations;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace Eventuras.Services.Tests.Registrations;

public class RegistrationProductsServiceTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly RegistrationRetrievalService _service;

    public RegistrationProductsServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);

        var accessControlService = new Mock<IRegistrationAccessControlService>();
        _service = new RegistrationRetrievalService(_context, accessControlService.Object);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task GetRegistrationProductsAsync_WithNullRegistration_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentNullException>(() =>
            _service.GetRegistrationProductsAsync(null!));
    }

    [Fact]
    public async Task GetRegistrationProductsAsync_WithNoOrders_ShouldReturnEmptyList()
    {
        // Arrange
        var registration = CreateRegistration();
        await _context.Registrations.AddAsync(registration);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.GetRegistrationProductsAsync(registration);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task GetRegistrationProductsAsync_WithSingleProduct_ShouldReturnAggregatedProduct()
    {
        // Arrange
        var product = CreateProduct("Conference Ticket", 1000m);
        await _context.Products.AddAsync(product);

        var registration = CreateRegistration();
        var order = CreateOrder(registration);
        order.OrderLines.Add(CreateOrderLine(product, 2));

        await _context.Registrations.AddAsync(registration);
        await _context.Orders.AddAsync(order);
        await _context.SaveChangesAsync();

        // Reload with navigation properties using service
        var registrationId = registration.RegistrationId;
        registration = await _service.GetRegistrationByIdAsync(registrationId, new RegistrationRetrievalOptions
        {
            LoadOrders = true,
            LoadProducts = true
        });

        // Act
        var result = await _service.GetRegistrationProductsAsync(registration);

        // Assert
        Assert.Single(result);
        Assert.Equal(product.ProductId, result[0].ProductId);
        Assert.Equal(2, result[0].Quantity);
        Assert.Equal("Conference Ticket", result[0].Product.Name);
    }

    [Fact]
    public async Task GetRegistrationProductsAsync_WithMultipleProducts_ShouldReturnSeparateItems()
    {
        // Arrange
        var product1 = CreateProduct("Ticket", 1000m);
        var product2 = CreateProduct("Workshop", 500m);
        await _context.Products.AddRangeAsync(product1, product2);

        var registration = CreateRegistration();
        var order = CreateOrder(registration);
        order.OrderLines.Add(CreateOrderLine(product1, 1));
        order.OrderLines.Add(CreateOrderLine(product2, 3));

        await _context.Registrations.AddAsync(registration);
        await _context.Orders.AddAsync(order);
        await _context.SaveChangesAsync();

        // Reload using service
        var registrationId = registration.RegistrationId;
        registration = await _service.GetRegistrationByIdAsync(registrationId, new RegistrationRetrievalOptions
        {
            LoadOrders = true,
            LoadProducts = true
        });

        // Act
        var result = await _service.GetRegistrationProductsAsync(registration);

        // Assert
        Assert.Equal(2, result.Count);
        Assert.Contains(result, p => p.ProductId == product1.ProductId && p.Quantity == 1);
        Assert.Contains(result, p => p.ProductId == product2.ProductId && p.Quantity == 3);
    }

    [Fact]
    public async Task GetRegistrationProductsAsync_WithProductVariants_ShouldGroupByVariant()
    {
        // Arrange
        var product = CreateProduct("T-Shirt", 200m);
        var variantS = CreateProductVariant(product, "Small", 200m);
        var variantL = CreateProductVariant(product, "Large", 250m);

        await _context.Products.AddAsync(product);
        await _context.ProductVariants.AddRangeAsync(variantS, variantL);

        var registration = CreateRegistration();
        var order = CreateOrder(registration);
        order.OrderLines.Add(CreateOrderLine(product, 2, variantS));
        order.OrderLines.Add(CreateOrderLine(product, 1, variantL));

        await _context.Registrations.AddAsync(registration);
        await _context.Orders.AddAsync(order);
        await _context.SaveChangesAsync();

        // Reload using service
        var registrationId = registration.RegistrationId;
        registration = await _service.GetRegistrationByIdAsync(registrationId, new RegistrationRetrievalOptions
        {
            LoadOrders = true,
            LoadProducts = true
        });

        // Act
        var result = await _service.GetRegistrationProductsAsync(registration);

        // Assert
        Assert.Equal(2, result.Count);

        var small = result.First(p => p.ProductVariantId == variantS.ProductVariantId);
        Assert.Equal(2, small.Quantity);
        Assert.Equal("Small", small.ProductVariant.Name);

        var large = result.First(p => p.ProductVariantId == variantL.ProductVariantId);
        Assert.Equal(1, large.Quantity);
        Assert.Equal("Large", large.ProductVariant.Name);
    }

    [Fact]
    public async Task GetRegistrationProductsAsync_WithMultipleOrders_ShouldSumQuantities()
    {
        // Arrange
        var product = CreateProduct("Ticket", 1000m);
        await _context.Products.AddAsync(product);

        var registration = CreateRegistration();
        var order1 = CreateOrder(registration);
        order1.OrderLines.Add(CreateOrderLine(product, 2));
        order1.Status = Order.OrderStatus.Verified;

        var order2 = CreateOrder(registration);
        order2.OrderLines.Add(CreateOrderLine(product, 3));

        await _context.Registrations.AddAsync(registration);
        await _context.Orders.AddRangeAsync(order1, order2);
        await _context.SaveChangesAsync();

        // Reload using service
        var registrationId = registration.RegistrationId;
        registration = await _service.GetRegistrationByIdAsync(registrationId, new RegistrationRetrievalOptions
        {
            LoadOrders = true,
            LoadProducts = true
        });

        // Act
        var result = await _service.GetRegistrationProductsAsync(registration);

        // Assert
        Assert.Single(result);
        Assert.Equal(5, result[0].Quantity); // 2 + 3
    }

    [Fact]
    public async Task GetRegistrationProductsAsync_WithCancelledOrder_ShouldExclude()
    {
        // Arrange
        var product1 = CreateProduct("Ticket", 1000m);
        var product2 = CreateProduct("Workshop", 500m);
        await _context.Products.AddRangeAsync(product1, product2);

        var registration = CreateRegistration();

        var activeOrder = CreateOrder(registration);
        activeOrder.OrderLines.Add(CreateOrderLine(product1, 2));

        var cancelledOrder = CreateOrder(registration);
        cancelledOrder.OrderLines.Add(CreateOrderLine(product2, 5));
        cancelledOrder.Status = Order.OrderStatus.Cancelled;

        await _context.Registrations.AddAsync(registration);
        await _context.Orders.AddRangeAsync(activeOrder, cancelledOrder);
        await _context.SaveChangesAsync();

        // Reload using service
        var registrationId = registration.RegistrationId;
        registration = await _service.GetRegistrationByIdAsync(registrationId, new RegistrationRetrievalOptions
        {
            LoadOrders = true,
            LoadProducts = true
        });

        // Act
        var result = await _service.GetRegistrationProductsAsync(registration);

        // Assert
        Assert.Single(result);
        Assert.Equal(product1.ProductId, result[0].ProductId);
        Assert.Equal(2, result[0].Quantity);
    }

    [Fact]
    public async Task GetRegistrationProductsAsync_WithRefund_ShouldCalculateNetQuantity()
    {
        // Arrange
        var product = CreateProduct("Ticket", 1000m);
        await _context.Products.AddAsync(product);

        var registration = CreateRegistration();

        var order1 = CreateOrder(registration);
        order1.OrderLines.Add(CreateOrderLine(product, 5));
        order1.Status = Order.OrderStatus.Verified;
        order1.Status = Order.OrderStatus.Invoiced;

        var refundOrder = CreateOrder(registration);
        refundOrder.OrderLines.Add(CreateOrderLine(product, -2));

        await _context.Registrations.AddAsync(registration);
        await _context.Orders.AddRangeAsync(order1, refundOrder);
        await _context.SaveChangesAsync();

        // Reload using service
        var registrationId = registration.RegistrationId;
        registration = await _service.GetRegistrationByIdAsync(registrationId, new RegistrationRetrievalOptions
        {
            LoadOrders = true,
            LoadProducts = true
        });

        // Act
        var result = await _service.GetRegistrationProductsAsync(registration);

        // Assert
        Assert.Single(result);
        Assert.Equal(3, result[0].Quantity); // 5 - 2
    }

    [Fact]
    public async Task GetRegistrationProductsAsync_WithZeroNetQuantity_ShouldExclude()
    {
        // Arrange
        var product = CreateProduct("Ticket", 1000m);
        await _context.Products.AddAsync(product);

        var registration = CreateRegistration();

        var order1 = CreateOrder(registration);
        order1.OrderLines.Add(CreateOrderLine(product, 3));
        order1.Status = Order.OrderStatus.Verified;
        order1.Status = Order.OrderStatus.Invoiced;

        var refundOrder = CreateOrder(registration);
        refundOrder.OrderLines.Add(CreateOrderLine(product, -3));

        await _context.Registrations.AddAsync(registration);
        await _context.Orders.AddRangeAsync(order1, refundOrder);
        await _context.SaveChangesAsync();

        // Reload using service
        var registrationId = registration.RegistrationId;
        registration = await _service.GetRegistrationByIdAsync(registrationId, new RegistrationRetrievalOptions
        {
            LoadOrders = true,
            LoadProducts = true
        });

        // Act
        var result = await _service.GetRegistrationProductsAsync(registration);

        // Assert
        Assert.Empty(result); // Net zero excluded
    }

    #region Specification Tests - Placing First Order

    [Fact]
    public async Task Scenario_PlacingFirstOrder_ShouldAggregateCorrectly()
    {
        // Arrange - The Great Conference products
        var ticket = CreateProduct("Conference ticket (3 days)", 1000m);
        var dinner = CreateProduct("Dinner", 400m);
        var smallDinner = CreateProductVariant(dinner, "Small dinner", 400m);
        var largeDinner = CreateProductVariant(dinner, "Large dinner", 600m);
        var dailyRate = CreateProduct("Daily rate", 200m);

        await _context.Products.AddRangeAsync(ticket, dinner, dailyRate);
        await _context.ProductVariants.AddRangeAsync(smallDinner, largeDinner);

        var registration = CreateRegistration();
        var order255 = CreateOrder(registration);
        order255.OrderLines.Add(CreateOrderLine(ticket, 1));
        order255.OrderLines.Add(CreateOrderLine(dinner, 1, smallDinner));
        order255.OrderLines.Add(CreateOrderLine(dailyRate, 2));

        await _context.Registrations.AddAsync(registration);
        await _context.Orders.AddAsync(order255);
        await _context.SaveChangesAsync();

        // Reload using service
        var registrationId = registration.RegistrationId;
        registration = await _service.GetRegistrationByIdAsync(registrationId, new RegistrationRetrievalOptions
        {
            LoadOrders = true,
            LoadProducts = true
        });

        // Act
        var result = await _service.GetRegistrationProductsAsync(registration);

        // Assert
        Assert.Equal(3, result.Count);
        Assert.Contains(result, p => p.Product.Name.Contains("Conference ticket") && p.Quantity == 1);
        Assert.Contains(result, p => p.ProductVariant?.Name == "Small dinner" && p.Quantity == 1);
        Assert.Contains(result, p => p.Product.Name == "Daily rate" && p.Quantity == 2);
    }

    #endregion

    #region Specification Tests - Case 1: Adding Product

    [Fact]
    public async Task Case1_AddingSightseeingToOrder_ShouldIncludeNewProduct()
    {
        // Arrange - Order #255 (Invoiced)
        var ticket = CreateProduct("Conference ticket", 1000m);
        var dinner = CreateProduct("Dinner", 400m);
        var smallDinner = CreateProductVariant(dinner, "Small", 400m);
        var dailyRate = CreateProduct("Daily rate", 200m);
        var sightseeing = CreateProduct("Sightseeing", 800m);

        await _context.Products.AddRangeAsync(ticket, dinner, dailyRate, sightseeing);
        await _context.ProductVariants.AddAsync(smallDinner);

        var registration = CreateRegistration();
        var order255 = CreateOrder(registration);
        order255.OrderLines.Add(CreateOrderLine(ticket, 1));
        order255.OrderLines.Add(CreateOrderLine(dinner, 1, smallDinner));
        order255.OrderLines.Add(CreateOrderLine(dailyRate, 2));
        order255.Status = Order.OrderStatus.Verified;
        order255.Status = Order.OrderStatus.Invoiced;

        // Order #256 - Adding Sightseeing
        var order256 = CreateOrder(registration);
        order256.OrderLines.Add(CreateOrderLine(sightseeing, 1));

        await _context.Registrations.AddAsync(registration);
        await _context.Orders.AddRangeAsync(order255, order256);
        await _context.SaveChangesAsync();

        // Reload using service
        var registrationId = registration.RegistrationId;
        registration = await _service.GetRegistrationByIdAsync(registrationId, new RegistrationRetrievalOptions
        {
            LoadOrders = true,
            LoadProducts = true
        });

        // Act
        var result = await _service.GetRegistrationProductsAsync(registration);

        // Assert
        Assert.Equal(4, result.Count);
        Assert.Contains(result, p => p.Product.Name.Contains("Conference") && p.Quantity == 1);
        Assert.Contains(result, p => p.ProductVariant?.Name == "Small" && p.Quantity == 1);
        Assert.Contains(result, p => p.Product.Name == "Daily rate" && p.Quantity == 2);
        Assert.Contains(result, p => p.Product.Name == "Sightseeing" && p.Quantity == 1);
    }

    #endregion

    #region Specification Tests - Case 2: Removing Product

    [Fact]
    public async Task Case2_RemovingDinnerFromOrder_ShouldExcludeProduct()
    {
        // Arrange - Order #255 (Invoiced)
        var ticket = CreateProduct("Conference ticket", 1000m);
        var dinner = CreateProduct("Dinner", 400m);
        var smallDinner = CreateProductVariant(dinner, "Small", 400m);
        var dailyRate = CreateProduct("Daily rate", 200m);

        await _context.Products.AddRangeAsync(ticket, dinner, dailyRate);
        await _context.ProductVariants.AddAsync(smallDinner);

        var registration = CreateRegistration();
        var order255 = CreateOrder(registration);
        order255.OrderLines.Add(CreateOrderLine(ticket, 1));
        order255.OrderLines.Add(CreateOrderLine(dinner, 1, smallDinner));
        order255.OrderLines.Add(CreateOrderLine(dailyRate, 2));
        order255.Status = Order.OrderStatus.Verified;
        order255.Status = Order.OrderStatus.Invoiced;

        // Order #256 - Refund dinner
        var order256 = CreateOrder(registration);
        order256.OrderLines.Add(CreateOrderLine(dinner, -1, smallDinner));

        await _context.Registrations.AddAsync(registration);
        await _context.Orders.AddRangeAsync(order255, order256);
        await _context.SaveChangesAsync();

        // Reload
        registration = await LoadRegistrationWithProducts(registration.RegistrationId);

        // Act
        var result = await _service.GetRegistrationProductsAsync(registration);

        // Assert
        Assert.Equal(2, result.Count); // Ticket and Daily rate only
        Assert.Contains(result, p => p.Product.Name.Contains("Conference") && p.Quantity == 1);
        Assert.Contains(result, p => p.Product.Name == "Daily rate" && p.Quantity == 2);
        Assert.DoesNotContain(result, p => p.Product.Name == "Dinner");
    }

    #endregion

    #region Specification Tests - Case 3: Increasing Quantity

    [Fact]
    public async Task Case3_IncreasingQuantity_ShouldSumCorrectly()
    {
        // Arrange - Order #255 (Invoiced)
        var ticket = CreateProduct("Conference ticket", 1000m);
        var dailyRate = CreateProduct("Daily rate", 200m);

        await _context.Products.AddRangeAsync(ticket, dailyRate);

        var registration = CreateRegistration();
        var order255 = CreateOrder(registration);
        order255.OrderLines.Add(CreateOrderLine(ticket, 1));
        order255.OrderLines.Add(CreateOrderLine(dailyRate, 2));
        order255.Status = Order.OrderStatus.Verified;
        order255.Status = Order.OrderStatus.Invoiced;

        // Order #256 - Add one more daily rate
        var order256 = CreateOrder(registration);
        order256.OrderLines.Add(CreateOrderLine(dailyRate, 1));

        await _context.Registrations.AddAsync(registration);
        await _context.Orders.AddRangeAsync(order255, order256);
        await _context.SaveChangesAsync();

        // Reload using service
        var registrationId = registration.RegistrationId;
        registration = await _service.GetRegistrationByIdAsync(registrationId, new RegistrationRetrievalOptions
        {
            LoadOrders = true,
            LoadProducts = true
        });

        // Act
        var result = await _service.GetRegistrationProductsAsync(registration);

        // Assert
        var dailyRateResult = result.First(p => p.Product.Name == "Daily rate");
        Assert.Equal(3, dailyRateResult.Quantity); // 2 + 1
    }

    #endregion

    #region Specification Tests - Case 4: Decreasing Quantity

    [Fact]
    public async Task Case4_DecreasingQuantity_ShouldSubtractCorrectly()
    {
        // Arrange - Order #255 (Invoiced)
        var ticket = CreateProduct("Conference ticket", 1000m);
        var dailyRate = CreateProduct("Daily rate", 200m);

        await _context.Products.AddRangeAsync(ticket, dailyRate);

        var registration = CreateRegistration();
        var order255 = CreateOrder(registration);
        order255.OrderLines.Add(CreateOrderLine(ticket, 1));
        order255.OrderLines.Add(CreateOrderLine(dailyRate, 2));
        order255.Status = Order.OrderStatus.Verified;
        order255.Status = Order.OrderStatus.Invoiced;

        // Order #256 - Remove one daily rate
        var order256 = CreateOrder(registration);
        order256.OrderLines.Add(CreateOrderLine(dailyRate, -1));

        await _context.Registrations.AddAsync(registration);
        await _context.Orders.AddRangeAsync(order255, order256);
        await _context.SaveChangesAsync();

        // Reload
        registration = await LoadRegistrationWithProducts(registration.RegistrationId);

        // Act
        var result = await _service.GetRegistrationProductsAsync(registration);

        // Assert
        var dailyRateResult = result.First(p => p.Product.Name == "Daily rate");
        Assert.Equal(1, dailyRateResult.Quantity); // 2 - 1
    }

    #endregion

    #region Specification Tests - Case 5: Changing Products

    [Fact]
    public async Task Case5_ChangingProducts_ShouldSwapCorrectly()
    {
        // Arrange - Order #255 (Invoiced)
        var ticket = CreateProduct("Conference ticket", 1000m);
        var dinner = CreateProduct("Dinner", 400m);
        var smallDinner = CreateProductVariant(dinner, "Small", 400m);
        var dailyRate = CreateProduct("Daily rate", 200m);
        var sightseeing = CreateProduct("Sightseeing", 800m);

        await _context.Products.AddRangeAsync(ticket, dinner, dailyRate, sightseeing);
        await _context.ProductVariants.AddAsync(smallDinner);

        var registration = CreateRegistration();
        var order255 = CreateOrder(registration);
        order255.OrderLines.Add(CreateOrderLine(ticket, 1));
        order255.OrderLines.Add(CreateOrderLine(dinner, 1, smallDinner));
        order255.OrderLines.Add(CreateOrderLine(dailyRate, 2));
        order255.Status = Order.OrderStatus.Verified;
        order255.Status = Order.OrderStatus.Invoiced;

        // Order #256 - Swap dinner for sightseeing
        var order256 = CreateOrder(registration);
        order256.OrderLines.Add(CreateOrderLine(dinner, -1, smallDinner));
        order256.OrderLines.Add(CreateOrderLine(sightseeing, 1));

        await _context.Registrations.AddAsync(registration);
        await _context.Orders.AddRangeAsync(order255, order256);
        await _context.SaveChangesAsync();

        // Reload
        registration = await LoadRegistrationWithProducts(registration.RegistrationId);

        // Act
        var result = await _service.GetRegistrationProductsAsync(registration);

        // Assert
        Assert.Equal(3, result.Count);
        Assert.Contains(result, p => p.Product.Name.Contains("Conference"));
        Assert.Contains(result, p => p.Product.Name == "Daily rate" && p.Quantity == 2);
        Assert.Contains(result, p => p.Product.Name == "Sightseeing" && p.Quantity == 1);
        Assert.DoesNotContain(result, p => p.Product.Name == "Dinner");
    }

    #endregion

    #region Specification Tests - Case 6: Changing Variant

    [Fact]
    public async Task Case6_ChangingVariant_ShouldSwapVariantCorrectly()
    {
        // Arrange - Order #255 (Invoiced)
        var ticket = CreateProduct("Conference ticket", 1000m);
        var dinner = CreateProduct("Dinner", 400m);
        var smallDinner = CreateProductVariant(dinner, "Small dinner", 400m);
        var largeDinner = CreateProductVariant(dinner, "Large dinner", 600m);
        var dailyRate = CreateProduct("Daily rate", 200m);

        await _context.Products.AddRangeAsync(ticket, dinner, dailyRate);
        await _context.ProductVariants.AddRangeAsync(smallDinner, largeDinner);

        var registration = CreateRegistration();
        var order255 = CreateOrder(registration);
        order255.OrderLines.Add(CreateOrderLine(ticket, 1));
        order255.OrderLines.Add(CreateOrderLine(dinner, 1, smallDinner));
        order255.OrderLines.Add(CreateOrderLine(dailyRate, 2));
        order255.Status = Order.OrderStatus.Verified;
        order255.Status = Order.OrderStatus.Invoiced;

        // Order #256 - Change from small to large dinner
        var order256 = CreateOrder(registration);
        order256.OrderLines.Add(CreateOrderLine(dinner, -1, smallDinner));
        order256.OrderLines.Add(CreateOrderLine(dinner, 1, largeDinner));

        await _context.Registrations.AddAsync(registration);
        await _context.Orders.AddRangeAsync(order255, order256);
        await _context.SaveChangesAsync();

        // Reload
        registration = await LoadRegistrationWithProducts(registration.RegistrationId);

        // Act
        var result = await _service.GetRegistrationProductsAsync(registration);

        // Assert
        Assert.Equal(3, result.Count);
        Assert.Contains(result, p => p.Product.Name.Contains("Conference"));
        Assert.Contains(result, p => p.Product.Name == "Daily rate");

        var dinnerResult = result.FirstOrDefault(p => p.Product.Name == "Dinner");
        Assert.NotNull(dinnerResult);
        Assert.Equal("Large dinner", dinnerResult.ProductVariant?.Name);
        Assert.Equal(1, dinnerResult.Quantity);
    }

    #endregion

    #region Specification Tests - Combination of Invoiced and Draft Orders

    [Fact]
    public async Task Scenario_CombinationOfInvoicedAndDraftOrders_ShouldAggregateCorrectly()
    {
        // Arrange
        var ticket = CreateProduct("Conference ticket", 1000m);
        var dinner = CreateProduct("Dinner", 400m);
        var smallDinner = CreateProductVariant(dinner, "Small dinner", 400m);
        var largeDinner = CreateProductVariant(dinner, "Large dinner", 600m);
        var dailyRate = CreateProduct("Daily rate", 200m);

        await _context.Products.AddRangeAsync(ticket, dinner, dailyRate);
        await _context.ProductVariants.AddRangeAsync(smallDinner, largeDinner);

        var registration = CreateRegistration();

        // Order #255 - Invoiced
        var order255 = CreateOrder(registration);
        order255.OrderLines.Add(CreateOrderLine(ticket, 1));
        order255.OrderLines.Add(CreateOrderLine(dinner, 1, smallDinner));
        order255.OrderLines.Add(CreateOrderLine(dailyRate, 2));
        order255.Status = Order.OrderStatus.Verified;
        order255.Status = Order.OrderStatus.Invoiced;

        // Order #256 - Verified (changing to large dinner)
        var order256 = CreateOrder(registration);
        order256.OrderLines.Add(CreateOrderLine(dinner, -1, smallDinner));
        order256.OrderLines.Add(CreateOrderLine(dinner, 1, largeDinner));
        order256.Status = Order.OrderStatus.Verified;

        await _context.Registrations.AddAsync(registration);
        await _context.Orders.AddRangeAsync(order255, order256);
        await _context.SaveChangesAsync();

        // Reload
        registration = await LoadRegistrationWithProducts(registration.RegistrationId);

        // Act
        var result = await _service.GetRegistrationProductsAsync(registration);

        // Assert - Should have large dinner, not small
        Assert.Equal(3, result.Count);
        Assert.Contains(result, p => p.Product.Name.Contains("Conference") && p.Quantity == 1);
        Assert.Contains(result, p => p.ProductVariant?.Name == "Large dinner" && p.Quantity == 1);
        Assert.Contains(result, p => p.Product.Name == "Daily rate" && p.Quantity == 2);
        Assert.DoesNotContain(result, p => p.ProductVariant?.Name == "Small dinner");
    }

    #endregion

    #region Specification Tests - Multiple Invoiced Orders

    [Fact]
    public async Task Scenario_MultipleInvoicedOrders_ShouldAggregateCorrectly()
    {
        // Arrange
        var ticket = CreateProduct("Conference ticket", 1000m);
        var dinner = CreateProduct("Dinner", 400m);
        var smallDinner = CreateProductVariant(dinner, "Small dinner", 400m);
        var dailyRate = CreateProduct("Daily rate", 200m);
        var sightseeing = CreateProduct("Sightseeing", 800m);

        await _context.Products.AddRangeAsync(ticket, dinner, dailyRate, sightseeing);
        await _context.ProductVariants.AddAsync(smallDinner);

        var registration = CreateRegistration();

        // Order #255 - Invoiced
        var order255 = CreateOrder(registration);
        order255.OrderLines.Add(CreateOrderLine(ticket, 1));
        order255.OrderLines.Add(CreateOrderLine(dinner, 1, smallDinner));
        order255.OrderLines.Add(CreateOrderLine(dailyRate, 2));
        order255.Status = Order.OrderStatus.Verified;
        order255.Status = Order.OrderStatus.Invoiced;

        // Order #256 - Invoiced (adding sightseeing)
        var order256 = CreateOrder(registration);
        order256.OrderLines.Add(CreateOrderLine(sightseeing, 1));
        order256.Status = Order.OrderStatus.Verified;
        order256.Status = Order.OrderStatus.Invoiced;

        await _context.Registrations.AddAsync(registration);
        await _context.Orders.AddRangeAsync(order255, order256);
        await _context.SaveChangesAsync();

        // Reload
        registration = await LoadRegistrationWithProducts(registration.RegistrationId);

        // Act
        var result = await _service.GetRegistrationProductsAsync(registration);

        // Assert
        Assert.Equal(4, result.Count);
        Assert.Contains(result, p => p.Product.Name.Contains("Conference") && p.Quantity == 1);
        Assert.Contains(result, p => p.ProductVariant?.Name == "Small dinner" && p.Quantity == 1);
        Assert.Contains(result, p => p.Product.Name == "Daily rate" && p.Quantity == 2);
        Assert.Contains(result, p => p.Product.Name == "Sightseeing" && p.Quantity == 1);
    }

    #endregion

    // Helper methods
    private async Task<Registration> LoadRegistrationWithProducts(int registrationId)
    {
        return await _service.GetRegistrationByIdAsync(registrationId, new RegistrationRetrievalOptions
        {
            LoadOrders = true,
            LoadProducts = true
        }, CancellationToken.None);
    }

    private Registration CreateRegistration()
    {
        return new Registration
        {
            EventInfoId = 1,
            UserId = "user1",
            Status = Registration.RegistrationStatus.Draft
        };
    }

    private Order CreateOrder(Registration registration)
    {
        return new Order
        {
            Registration = registration,
            UserId = registration.UserId,
            OrderLines = new List<OrderLine>()
        };
    }

    private Product CreateProduct(string name, decimal price)
    {
        return new Product
        {
            Name = name,
            Price = price,
            EventInfoId = 1
        };
    }

    private ProductVariant CreateProductVariant(Product product, string name, decimal price)
    {
        return new ProductVariant
        {
            Product = product,
            ProductId = product.ProductId,
            Name = name,
            Price = price
        };
    }

    private OrderLine CreateOrderLine(Product product, int quantity, ProductVariant variant = null)
    {
        return new OrderLine
        {
            Product = product,
            ProductId = product.ProductId,
            ProductVariant = variant,
            ProductVariantId = variant?.ProductVariantId,
            Quantity = quantity,
            Price = variant?.Price ?? product.Price
        };
    }
}
