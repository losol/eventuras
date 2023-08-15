using System.Collections.Generic;
using Eventuras.Domain;
using Xunit;

namespace Eventuras.UnitTests.RegistrationTests;

public class Products_Should
{
    [Fact]
    public void Return_Products_Simple_TestCase()
    {
        // Arrange
        var registration = new Registration
        {
            Orders = new List<Order>
            {
                new()
                {
                    OrderLines = new List<OrderLine>
                    {
                        Helpers.GetOrderLine(1, 100),
                        Helpers.GetOrderLine(2, 100),
                    },
                },
                new()
                {
                    OrderLines = new List<OrderLine>
                    {
                        Helpers.GetOrderLine(3, 100),
                    },
                },
            },
        };

        var expectedProducts = new List<OrderDTO>
        {
            Helpers.GetOrderDto(1, 100),
            Helpers.GetOrderDto(2, 100),
            Helpers.GetOrderDto(3, 100),
        };

        // Act
        var products = registration.Products;

        // Assert
        Assert.Equal(3, products.Count);
        Assert.Equal(expectedProducts, products, new OrderDTOProductAndVariantComparer());
    }

    /// <summary> Test case taken from https://github.com/losol/Eventuras/issues/236 </summary>
    [Fact]
    public void Return_Products_Complex_TestCase()
    {
        // Arrange
        var registration = new Registration
        {
            Orders = new List<Order>
            {
                new()
                {
                    OrderId = 255,
                    OrderLines = new List<OrderLine>
                    {
                        Helpers.GetOrderLine(1, 1000), // Conference ticket (3 days)
                        Helpers.GetOrderLine(2, variantId: 1, price: 400, quantity: 1), // Small Dinner
                        Helpers.GetOrderLine(3, 200, 3), // Daily rate
                    },
                },
                new()
                {
                    OrderId = 256,
                    OrderLines = new List<OrderLine>
                    {
                        Helpers.GetOrderLine(4, 800), // Sightseeing
                    },
                },
                new()
                {
                    OrderId = 257,
                    OrderLines = new List<OrderLine>
                    {
                        Helpers.GetOrderLine(3, 200, -1), // Daily rate
                    },
                },
                new()
                {
                    OrderId = 258,
                    OrderLines = new List<OrderLine>
                    {
                        Helpers.GetOrderLine(4, 800, -1), // Sightseeing
                    },
                },
            },
        };
        registration.Orders.ForEach(o =>
        {
            o.MarkAsVerified();
            o.MarkAsInvoiced();
        });

        var expectedProducts = new List<OrderDTO>
        {
            Helpers.GetOrderDto(1, 1000),
            Helpers.GetOrderDto(2, variantId: 1, price: 400, quantity: 1),
            Helpers.GetOrderDto(3, 200, 2),
        };

        // Act
        var products = registration.Products;

        // Assert
        Assert.Equal(expectedProducts, products, new OrderDTOProductAndVariantComparer());
    }

    [Fact]
    public void Return_Products_When_Variants_Were_Changed()
    {
        // Arrange
        var registration = new Registration
        {
            Orders = new List<Order>
            {
                new()
                {
                    OrderLines = new List<OrderLine>
                    {
                        Helpers.GetOrderLine(1, 1000), // Conference ticket (3 days)
                        Helpers.GetOrderLine(2, variantId: 1, price: 400, quantity: 1), // Small Dinner
                        Helpers.GetOrderLine(3, 200, 3), // Daily rate
                    },
                },
                new()
                {
                    OrderLines = new List<OrderLine>
                    {
                        Helpers.GetOrderLine(2, variantId: 1, price: 400, quantity: -1),
                        Helpers.GetOrderLine(2, variantId: 2, price: 600, quantity: 1),
                    },
                },
            },
        };
        registration.Orders.ForEach(o =>
        {
            o.MarkAsVerified();
            o.MarkAsInvoiced();
        });

        var expectedProducts = new List<OrderDTO>
        {
            Helpers.GetOrderDto(1, 1000),
            Helpers.GetOrderDto(3, 200, 2),
            Helpers.GetOrderDto(2, variantId: 2, price: 600, quantity: 1),
        };

        // Act
        var products = registration.Products;

        // Assert
        Assert.Equal(expectedProducts, products, new OrderDTOProductAndVariantComparer());
    }
}