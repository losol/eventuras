#nullable enable

using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Orders
{
    public interface IOrderManagementService
    {
        /// <summary>
        /// Marks order as canceled (soft delete).
        /// </summary>
        /// <param name="order">Order to cancel.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task CancelOrderAsync(Order order, CancellationToken cancellationToken = default);

        /// <summary>
        /// Updates order lines in order.
        /// </summary>
        /// <param name="order">Order to update.</param>
        /// <param name="newOrderLines">Full update of lines in the order.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task UpdateOrderLinesAsync(Order order, ICollection<OrderLineModel> newOrderLines, CancellationToken cancellationToken = default);

        /// <summary>
        /// Creates a new order for given registration.
        /// </summary>
        /// <param name="registrationId">Registration to create order for.</param>
        /// <param name="orderLines">Order lines.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Created order.</returns>
        Task<Order> CreateOrderForRegistrationAsync(
            int registrationId,
            ICollection<OrderLineModel> orderLines,
            CancellationToken cancellationToken = default);
    }
}
