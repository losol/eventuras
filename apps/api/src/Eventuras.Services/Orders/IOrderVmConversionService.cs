using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Orders;

[Obsolete]
public interface IOrderVmConversionService
{
    Task<IEnumerable<OrderDTO>> OrderVmsToOrderDtos(ICollection<OrderVM> orders);
}
