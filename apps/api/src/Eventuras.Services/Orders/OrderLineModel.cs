#nullable enable

using Eventuras.Domain;

namespace Eventuras.Services.Orders;

public record OrderLineModel(int ProductId, int? ProductVariantId, int Quantity)
{
    public OrderLineModel CopyWithInvertedQuantity() => this with { Quantity = -this.Quantity };

    public static OrderLineModel FromOrderLineDomainModel(OrderLine orderLine) => new((int)orderLine.ProductId!, orderLine.ProductVariantId, orderLine.Quantity);
};
