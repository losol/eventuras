using System.ComponentModel.DataAnnotations;
using Eventuras.Services.Registrations;

namespace Eventuras.WebApi.Controllers.Registrations
{
    public class RegistrationOrderItemDto
    {
        [Range(1, int.MaxValue)]
        public int ProductId { get; set; }

        [Range(1, int.MaxValue)]
        public int? ProductVariantId { get; set; }

        [Range(1, int.MaxValue)]
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
