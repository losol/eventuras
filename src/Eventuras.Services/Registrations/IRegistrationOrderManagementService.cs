using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Registrations
{
    public interface IRegistrationOrderManagementService
    {
        /// <exception cref="Exceptions.NotAccessibleException">Registration cannot be modified by the currently logged in user.</exception>
        /// <exception cref="Exceptions.NotFoundException">Product or product variant not found.</exception>
        Task<Order> CreateOrderForRegistrationAsync(
            Registration registration,
            OrderItemDto[] data = null,
            CancellationToken cancellationToken = default);
    }

    public class OrderItemDto
    {
        public int ProductId { get; set; }
        public int? VariantId { get; set; }
        public int Quantity { get; set; } = 1;
    }
}
