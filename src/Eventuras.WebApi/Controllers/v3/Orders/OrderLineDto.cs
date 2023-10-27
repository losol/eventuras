#nullable enable

using Eventuras.Domain;
using Eventuras.WebApi.Controllers.Events.Products;
using System;

namespace Eventuras.WebApi.Controllers.Orders
{
    public class OrderLineDto : IEquatable<OrderLineDto>
    {
        public int OrderLineId { get; set; }

        public ProductDto Product { get; set; }

        public ProductVariantDto? ProductVariant { get; set; }

        public int Quantity { get; set; }

        [Obsolete("For JSON deserialization only, do not use manually", true)]
        public OrderLineDto()
        {
            Product = null!;
        }

        public OrderLineDto(OrderLine orderLine)
        {
            ArgumentNullException.ThrowIfNull(orderLine);

            OrderLineId = orderLine.OrderLineId;

            Product = new ProductDto(orderLine.Product);
            if (orderLine.ProductVariant != null)
            {
                ProductVariant = new ProductVariantDto(orderLine.ProductVariant);
            }

            Quantity = orderLine.Quantity;
        }

        public bool Equals(OrderLineDto? other)
        {
            if (ReferenceEquals(null, other)) return false;
            if (ReferenceEquals(this, other)) return true;
            return OrderLineId == other.OrderLineId
                && Equals(Product.ProductId, other.Product.ProductId)
                && Equals(ProductVariant?.ProductVariantId, other.ProductVariant?.ProductVariantId)
                && Quantity == other.Quantity;
        }

        public override bool Equals(object? obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            if (obj.GetType() != typeof(OrderLineDto)) return false;
            return Equals((OrderLineDto)obj);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(OrderLineId, Product, ProductVariant, Quantity);
        }
    }
}
