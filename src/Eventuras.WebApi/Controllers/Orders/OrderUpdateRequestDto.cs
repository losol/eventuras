using System.ComponentModel.DataAnnotations;
using Eventuras.Services.Orders;

namespace Eventuras.WebApi.Controllers.Orders
{
    public class OrderUpdateRequestDto
    {
        [Required] public OrderLineUpdateDto[] Lines { get; set; }

        public OrderUpdates ToOrderUpdates()
        {
            var updates = new OrderUpdates();
            foreach (var item in Lines)
            {
                var productUpdateBuilder = updates.AddProduct(item.ProductId, item.Quantity);
                if (item.ProductVariantId.HasValue)
                {
                    productUpdateBuilder.WithVariant(item.ProductVariantId.Value);
                }
            }

            return updates;
        }
    }
}
