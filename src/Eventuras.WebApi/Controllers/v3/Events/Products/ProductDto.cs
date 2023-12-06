#nullable enable

using Eventuras.Domain;
using System;
using System.Linq;

namespace Eventuras.WebApi.Controllers.v3.Events.Products
{
    public class ProductDto
    {
        public int ProductId { get; set; }

        public string Name { get; set; }

        public string? Description { get; set; }

        public string? More { get; set; }

        public decimal Price { get; set; }

        public int VatPercent { get; set; }

        public ProductVisibility Visibility { get; set; }

        public ProductVariantDto[] Variants { get; set; }

        public int MinimumQuantity { get; set; }

        public bool IsMandatory => MinimumQuantity > 0;

        public bool EnableQuantity { get; set; }

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
            More = product.MoreInformation;
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
    }
}