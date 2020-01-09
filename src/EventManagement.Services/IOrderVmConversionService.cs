using losol.EventManagement.Domain;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace losol.EventManagement.Services
{
    public interface IOrderVmConversionService
    {
        Task<IEnumerable<OrderDTO>> OrderVmsToOrderDtos(ICollection<OrderVM> orders);
    }
}
