#nullable enable

using System;
using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.Events.Products;

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
}