using Eventuras.Services.Orders;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Eventuras.WebApi.Controllers.Orders;

public class OrderUpdateRequestDto
{
    [Required] public ICollection<OrderLineModel> Lines { get; init; } = null!;
}