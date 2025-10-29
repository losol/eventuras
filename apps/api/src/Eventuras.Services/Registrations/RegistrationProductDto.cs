using Eventuras.Domain;

namespace Eventuras.Services.Registrations;

#nullable enable

/// <summary>
/// DTO for aggregated product information in a registration.
/// Represents the sum of all order lines grouped by product and variant.
/// </summary>
public class RegistrationProductDto
{
    public int ProductId { get; set; }
    public int? ProductVariantId { get; set; }
    public Product Product { get; set; } = null!;
    public ProductVariant? ProductVariant { get; set; }
    public int Quantity { get; set; }
}
