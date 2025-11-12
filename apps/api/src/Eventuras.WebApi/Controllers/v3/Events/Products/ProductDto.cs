#nullable enable

using System;
using System.Linq;
using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.v3.Events.Products;

public class ProductDto
{
    [Obsolete("For JSON deserialization only, do not use manually", true)]
    public ProductDto()
    {
        Name = null!;
        Variants = null!;
    }

    public ProductDto(Product product)
    {
        ArgumentNullException.ThrowIfNull(product);

        ProductId = product.ProductId;
        Name = product.Name;
        Description = product.Description;
        Price = product.Price;
        VatPercent = product.VatPercent;
        Visibility = product.Visibility;
        Variants = product.ProductVariants?
            .Where(v => !v.Archived)
            .Select(v => new ProductVariantDto(v))
            .ToArray() ?? Array.Empty<ProductVariantDto>();
        MinimumQuantity = product.MinimumQuantity;
        EnableQuantity = product.EnableQuantity;
    }

    public int ProductId { get; set; }

    public string Name { get; set; }

    public string? Description { get; set; }

    public decimal Price { get; set; }

    public int VatPercent { get; set; }

    public ProductVisibility Visibility { get; set; }

    public int? Inventory { get; set; }
    public bool? Published { get; set; }

    public ProductVariantDto[] Variants { get; set; }

    public int MinimumQuantity { get; set; }

    public bool IsMandatory => MinimumQuantity > 0;

    public bool EnableQuantity { get; set; }

    public void CopyTo(Product product)
    {
        if (product == null)
        {
            throw new ArgumentNullException(nameof(product));
        }

        product.Name = Name;
        product.Description = Description;
        product.Price = Price;
        product.VatPercent = VatPercent;
        product.Visibility = Visibility;

        if (Published.HasValue)
        {
            product.Published = Published.Value;
        }

        if (Inventory.HasValue)
        {
            product.Inventory = Inventory.Value;
        }
    }
}
