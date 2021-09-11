using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Orders
{
    public interface IOrderManagementService
    {
        Task CancelOrderAsync(Order order);
    }
}
