using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Eventuras.Services.Orders;

namespace Eventuras.WebApi.Controllers.Orders;

public class OrderUpdateRequestDto
{
    [Required]
    public ICollection<OrderLineModel> Lines { get; init; } = null!;
}