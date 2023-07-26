using System;
using Eventuras.Domain;
using Eventuras.WebApi.Controllers.Events.Products;

namespace Eventuras.WebApi.Controllers.Registrations
{
    public class RegistrationOrderLineDto
    {
        public ProductDto Product { get; set; }

        public ProductVariantDto ProductVariant { get; set; }

        public int Quantity { get; set; }

        public RegistrationOrderLineDto()
        {
        }

        public RegistrationOrderLineDto(OrderLine orderLine)
        {
            if (orderLine == null)
            {
                throw new ArgumentNullException(nameof(orderLine));
            }

            Product = new ProductDto(orderLine.Product);
            if (orderLine.ProductVariant != null)
            {
                ProductVariant = new ProductVariantDto(orderLine.ProductVariant);
            }

            Quantity = orderLine.Quantity;
        }
    }
}
