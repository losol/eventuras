using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Orders;

public interface IOrderAccessControlService
{
    /// <exception cref="Exceptions.NotAccessibleException">Order cannot be accessed for read.</exception>
    Task CheckOrderReadAccessAsync(Order order, CancellationToken cancellationToken = default);

    /// <exception cref="Exceptions.NotAccessibleException">Order cannot be accessed for update.</exception>
    Task CheckOrderUpdateAccessAsync(Order order, CancellationToken cancellationToken = default);

    Task<IQueryable<Order>> AddAccessFilterAsync(IQueryable<Order> query,
        CancellationToken cancellationToken = default);

    Task<bool> HasAdminAccessAsync(Order order, CancellationToken cancellationToken = default);
}
