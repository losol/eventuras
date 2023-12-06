using System.ComponentModel.DataAnnotations;

namespace Eventuras.WebApi.Controllers.v3.Orders;

public class NewOrderRequestDto : OrderUpdateRequestDto
{
    [Required] public int RegistrationId { get; init; }
}