using System;
using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.v3.Events.Products;

public class ProductVariantDto
{
    public ProductVariantDto()
    {
    }

    public ProductVariantDto(ProductVariant variant)
    {
        if (variant == null)
        {
            throw new ArgumentNullException(nameof(variant));
        }

        ProductVariantId = variant.ProductVariantId;
        Name = variant.Name;
        Description = variant.Description;
        Price = variant.Price;
        VatPercent = variant.VatPercent;
    }

    public int ProductVariantId { get; set; }
    public string Name { get; set; }

    public string Description { get; set; }

    public decimal Price { get; set; }

    public int VatPercent { get; set; }
}
