using Eventuras.Domain;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.Orders
{
    public interface IOrderRetrievalService
    {
        Task<Order> GetOrderByIdAsync(int id,
            OrderRetrievalOptions options = null,
            CancellationToken cancellationToken = default);

        Task<Paging<Order>> ListOrdersAsync(
            OrderListRequest request,
            OrderRetrievalOptions options = default,
            CancellationToken cancellationToken = default);
    }
}
