#nullable enable

using Eventuras.Services.Orders;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Eventuras.WebApi.Controllers.Registrations;

public class NewRegistrationOrderDto
{
    [Required, MinLength(1)]
    public ICollection<OrderLineModel> Items { get; init; }
}