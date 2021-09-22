using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Registrations
{
    public interface IRegistrationOrderManagementService
    {
        /// <exception cref="Exceptions.NotAccessibleException">Registration cannot be modified by the currently logged in user.</exception>
        /// <exception cref="Exceptions.NotFoundException">Registration not found.</exception>
        /// <exception cref="Exceptions.InputException">Invalid products configuration in <c>data</c>.</exception>
        Task<Order> CreateOrderForRegistrationAsync(
            int registrationId,
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
