using Eventuras.Services.Registrations;

namespace Eventuras.WebApi.Controllers.Registrations
{
    public class RegistrationOrderItemDto
    {
        public int ProductId { get; set; }

        public int? ProductVariantId { get; set; }

        public int Quantity { get; set; }

        public OrderItemDto ToOrderItemDto()
        {
            return new OrderItemDto
            {
                ProductId = ProductId,
                VariantId = ProductVariantId,
                Quantity = Quantity
            };
        }
    }
}
