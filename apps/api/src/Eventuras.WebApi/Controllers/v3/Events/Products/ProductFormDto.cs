using Eventuras.Domain;
using System;

namespace Eventuras.WebApi.Controllers.v3.Events.Products
{
    public class ProductFormDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public decimal VatPercent { get; set; }

        public bool? Published { get; set; }

        public ProductVisibility? Visibility { get; set; }

        public void CopyTo(Product product)
        {
            if (product == null)
            {
                throw new ArgumentNullException(nameof(product));
            }

            Name = product.Name;
            Description = product.Description;
            Price = product.Price;
            VatPercent = product.VatPercent;

            if (Published.HasValue)
            {
                product.Published = Published.Value;
            }

            if (Visibility.HasValue)
            {
                product.Visibility = Visibility.Value;
            }
        }
    }
}
