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
    }
}