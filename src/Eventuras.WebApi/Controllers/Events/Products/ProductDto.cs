using System;
using System.Linq;
using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.Events.Products
{
    public class ProductDto
    {
        public int ProductId { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public string More { get; set; }

        public decimal Price { get; set; }

        public int VatPercent { get; set; }

        public ProductVisibility Visibility { get; set; }

        public ProductVariantDto[] Variants { get; set; }


        public ProductDto()
        {
        }

        public ProductDto(Product product)
        {
            if (product == null)
            {
                throw new ArgumentNullException(nameof(product));
            }

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
        }
    }
}
