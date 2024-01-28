using Eventuras.Domain;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Eventuras.Services.Orders
{
    [Obsolete]
    public interface IOrderVmConversionService
    {
        Task<IEnumerable<OrderDTO>> OrderVmsToOrderDtos(ICollection<OrderVM> orders);
    }
}
