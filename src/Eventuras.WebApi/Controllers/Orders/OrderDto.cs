using System.Linq;
using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.Orders
{
    public class OrderDto
    {
        public int OrderId { get; set; }

        public OrderLineDto[] Items { get; set; }

        public OrderDto()
        {
        }

        public OrderDto(Order order)
        {
            OrderId = order.OrderId;
            Items = order.OrderLines?
                .Select(l => new OrderLineDto(l))
                .ToArray();
        }
    }
}
