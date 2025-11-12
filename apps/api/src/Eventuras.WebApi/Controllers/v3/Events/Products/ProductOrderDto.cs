#nullable enable

using System;

namespace Eventuras.WebApi.Controllers.v3.Events.Products;

public record ProductOrderDto(
    int ProductId,
    int? ProductVariantId,
    ProductDto Product,
    ProductVariantDto? ProductVariant,
    int Quantity)
{
    public virtual bool Equals(ProductOrderDto? other)
    {
        if (ReferenceEquals(null, other))
        {
            return false;
        }

        if (ReferenceEquals(this, other))
        {
            return true;
        }

        return ProductId == other.ProductId
               && ProductVariantId == other.ProductVariantId
               && Quantity == other.Quantity;
    }

    public override int GetHashCode() => HashCode.Combine(ProductId, ProductVariantId, Quantity);
}
