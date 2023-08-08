#nullable enable

namespace Eventuras.Services.Orders;

public record OrderLineModel(int ProductId, int? ProductVariantId, int Quantity);