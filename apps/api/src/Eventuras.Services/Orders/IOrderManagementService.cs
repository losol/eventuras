#nullable enable

using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Orders;

public interface IOrderManagementService
{
    /// <summary>
    ///     Updates order details.
    /// </summary>
    /// <param name="order">Order to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task<Order> UpdateOrderAsync(Order order, CancellationToken cancellationToken = default);

    /// <summary>
    ///     Marks order as canceled (soft delete).
    /// </summary>
    /// <param name="order">Order to cancel.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task CancelOrderAsync(Order order, CancellationToken cancellationToken = default);

    /// <summary>
    ///     Updates order lines in order.
    /// </summary>
    /// <param name="order">Order to update.</param>
    /// <param name="newOrderLines">Full update of lines in the order.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task UpdateOrderLinesAsync(Order order, ICollection<OrderLineModel> newOrderLines,
        CancellationToken cancellationToken = default);

    /// <summary>
    ///     Creates a new order for given registration.
    /// </summary>
    /// <param name="registrationId">Registration to create order for.</param>
    /// <param name="orderLines">Order lines.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Created order.</returns>
    Task<Order> CreateOrderForRegistrationAsync(
        int registrationId,
        ICollection<OrderLineModel> orderLines,
        CancellationToken cancellationToken = default);

    /// <summary>
    ///     Creates a new order or updates existing order to make registration have all
    ///     specified <paramref name="expectedOrderLines" /> for all orders in total.
    /// </summary>
    /// <remarks>
    ///     Order will be created only if there are no open orders (with status <see cref="Order.OrderStatus.Draft" />) in
    ///     registration.
    ///     If registration has multiple open orders, last one by creation date is selected for update.
    /// </remarks>
    /// <param name="registrationId">Registration to create or update order for.</param>
    /// <param name="expectedOrderLines">Order lines for registration in total.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Created or updated order. Returns null if no actions are to perform.</returns>
    Task<Order?> AutoCreateOrUpdateOrder(
        int registrationId,
        IEnumerable<OrderLineModel> expectedOrderLines,
        CancellationToken cancellationToken = default);
}
