using Eventuras.Domain;
using System;

namespace Eventuras.WebApi.Controllers.v3.Events.Products
{
    public class ProductFormDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int VatPercent { get; set; }

        public bool EnableQuantity { get; set; } = false;

        public int MinimumQuantity { get; set; } = 0;
        public int? Inventory { get; set; }

        public bool? Published { get; set; }

        public ProductVisibility? Visibility { get; set; }

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
            product.EnableQuantity = EnableQuantity;
            product.MinimumQuantity = MinimumQuantity;

            if (Inventory.HasValue)
            {
                product.Inventory = Inventory.Value;
            }

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
