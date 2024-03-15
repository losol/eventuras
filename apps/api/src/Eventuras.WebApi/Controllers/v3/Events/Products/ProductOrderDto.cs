#nullable enable

using System;
using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.v3.Events.Products;

public record ProductOrderDto(
    int ProductId,
    int? ProductVariantId,
    ProductDto Product,
    ProductVariantDto? ProductVariant,
    int Quantity)
{
    public static ProductOrderDto FromRegistrationOrderDto(OrderDTO order)
    {
        ArgumentNullException.ThrowIfNull(order);
        ArgumentNullException.ThrowIfNull(order.Product);

        return new ProductOrderDto(order.Product.ProductId,
            order.Variant?.ProductVariantId,
            new ProductDto(order.Product),
            order.Variant == null ? null : new ProductVariantDto(order.Variant),
            order.Quantity);
    }

    public virtual bool Equals(ProductOrderDto? other)
    {
        if (ReferenceEquals(null, other))
            return false;
        if (ReferenceEquals(this, other))
            return true;
        return ProductId == other.ProductId
            && ProductVariantId == other.ProductVariantId
            && Quantity == other.Quantity;
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(ProductId, ProductVariantId, Quantity);
    }
}
