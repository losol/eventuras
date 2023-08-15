#nullable enable

using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Eventuras.Services.Orders;

namespace Eventuras.WebApi.Controllers.Registrations;

public class NewRegistrationOrderDto
{
    [Required]
    [MinLength(1)]
    public ICollection<OrderLineModel> Items { get; init; }
}