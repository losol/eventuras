using System;
using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.Products
{
    public class ProductDto
    {
        public int ProductId { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public string More { get; set; }

        public decimal Price { get; set; }

        public int VatPercent { get; set; }

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
        }
    }
}
