using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using static Eventuras.Services.Orders.OrderRetrievalService;

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


    Task<List<ProductOrdersSummaryDto>> GetProductOrdersSummaryAsync(
        int productId,
        CancellationToken cancellationToken = default);

}
