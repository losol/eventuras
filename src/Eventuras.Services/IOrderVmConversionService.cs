using Eventuras.Domain;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Eventuras.Services
{
    public interface IOrderVmConversionService
    {
        Task<IEnumerable<OrderDTO>> OrderVmsToOrderDtos(ICollection<OrderVM> orders);
    }
}
