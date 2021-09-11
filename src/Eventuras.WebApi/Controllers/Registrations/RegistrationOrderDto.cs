using System.Linq;
using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.Registrations
{
    public class RegistrationOrderDto
    {
        public int OrderId { get; set; }

        public RegistrationOrderLineDto[] Items { get; set; }

        public RegistrationOrderDto()
        {
        }

        public RegistrationOrderDto(Order order)
        {
            OrderId = order.OrderId;
            Items = order.OrderLines?
                .Select(l => new RegistrationOrderLineDto(l))
                .ToArray();
        }
    }
}
