using System;
using Eventuras.Domain;
using Eventuras.WebApi.Controllers.Events;
using Eventuras.WebApi.Controllers.Events.Products;

namespace Eventuras.WebApi.Controllers.Orders
{
    public class OrderLineDto
    {
        public int OrderLineId { get; set; }
        public ProductDto Product { get; set; }

        public ProductVariantDto ProductVariant { get; set; }

        public int Quantity { get; set; }

        public OrderLineDto()
        {
        }

        public OrderLineDto(OrderLine orderLine)
        {
            if (orderLine == null)
            {
                throw new ArgumentNullException(nameof(orderLine));
            }

            OrderLineId = orderLine.OrderLineId;

            Product = new ProductDto(orderLine.Product);
            if (orderLine.ProductVariant != null)
            {
                ProductVariant = new ProductVariantDto(orderLine.ProductVariant);
            }

            Quantity = orderLine.Quantity;
        }
    }
}
