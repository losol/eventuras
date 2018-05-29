using System.Collections.Generic;
using losol.EventManagement.Domain;

namespace losol.EventManagement.UnitTests
{
    internal static class Helpers
    {
        internal static OrderLine GetOrderLine(int productId, decimal price, int quantity = 1, int? variantId = null)
        {
            return new OrderLine
            {
                ProductId = productId,
                Product = new Product
                {
                    ProductId = productId
                },
                Price = price,
                Quantity = quantity,

                ProductVariantId = variantId,
                ProductVariant = variantId.HasValue ? new ProductVariant
                {
                    ProductVariantId = variantId.Value,
                    ProductId = productId
                } : null
            };
        }

        internal static OrderDTO GetOrderDto(int productId, decimal price, int quantity = 1, int? variantId = null)
        {
            return new OrderDTO
            {
                Product = new Product { ProductId = productId, Price = price },
                Variant = variantId.HasValue ? new ProductVariant
                {
                    ProductVariantId = variantId.Value,
                    ProductId = productId,
                    Price = price
                } : null,
                Quantity = quantity
            };
        }

        internal static Registration GetTestCaseRegistration()
        {
            var registration = new Registration
            {
                Orders = new List<Order>
                {
                    new Order
                    {
                        OrderId = 255,
                        OrderLines = new List<OrderLine>
                        {
                            Helpers.GetOrderLine(productId: 1, price: 1000, quantity: 1), // Conference ticket (3 days)
                            Helpers.GetOrderLine(productId: 2, variantId: 1, price: 400, quantity: 1), // Small Dinner
                            Helpers.GetOrderLine(productId: 3, price: 200, quantity: 2) // Daily rate
                        }
                    }
                }
            };
            registration.Orders.ForEach(o =>
                {
                    o.MarkAsVerified();
                    o.MarkAsInvoiced();
                }
            );
            return registration;
        }
    }
}