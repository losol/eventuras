using System.Collections.Generic;
using Eventuras.Domain;

namespace Eventuras.UnitTests;

internal static class Helpers
{
    internal static OrderLine GetOrderLine(int productId, decimal price, int quantity = 1, int? variantId = null)
        => new()
        {
            ProductId = productId,
            Product = new Product
            {
                ProductId = productId,
                Price = price,
            },
            Price = price,
            Quantity = quantity,

            ProductVariantId = variantId,
            ProductVariant = variantId.HasValue
                ? new ProductVariant
                {
                    ProductVariantId = variantId.Value,
                    ProductId = productId,
                    Price = price,
                }
                : null,
        };

    internal static OrderDTO GetOrderDto(int productId, decimal price, int quantity = 1, int? variantId = null)
        => new()
        {
            Product = new Product { ProductId = productId, Price = price },
            Variant = variantId.HasValue
                ? new ProductVariant
                {
                    ProductVariantId = variantId.Value,
                    ProductId = productId,
                    Price = price,
                }
                : null,
            Quantity = quantity,
        };

    internal static Registration GetTestCaseRegistration()
    {
        var registration = new Registration
        {
            Orders = new List<Order>
            {
                new()
                {
                    OrderId = 255,
                    OrderLines = new List<OrderLine>
                    {
                        GetOrderLine(1, 1000, 1), // Conference ticket (3 days)
                        GetOrderLine(2, variantId: 1, price: 400, quantity: 1), // Small Dinner
                        GetOrderLine(3, 200, 2), // Daily rate
                    },
                },
            },
        };
        registration.Orders.ForEach(o =>
        {
            o.MarkAsVerified();
            o.MarkAsInvoiced();
        });
        return registration;
    }
}