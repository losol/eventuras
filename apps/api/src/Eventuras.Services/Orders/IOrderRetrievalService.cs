using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Orders;

public interface IOrderRetrievalService
{
    Task<Order> GetOrderByIdAsync(int id,
        OrderRetrievalOptions options = null,
        CancellationToken cancellationToken = default);

    Task<Paging<Order>> ListOrdersAsync(
        OrderListRequest request,
        OrderRetrievalOptions options = default,
        CancellationToken cancellationToken = default);

    Task<ProductDeliverySummaryDto> GetProductDeliverySummaryAsync(
        int productId,
        CancellationToken cancellationToken = default);

    /// <summary>
    ///     Retrieves orders and populates them with data from registrations.
    /// </summary>
    /// <param name="orderIds">List of order IDs to retrieve and populate.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of orders populated with registration data.</returns>
    Task<List<Order>> GetOrdersPopulatedByRegistrationAsync(IEnumerable<int> orderIds,
        CancellationToken cancellationToken = default);
}
