using System.ComponentModel.DataAnnotations;

namespace Eventuras.WebApi.Controllers.Orders;

public class NewOrderRequestDto : OrderUpdateRequestDto
{
    [Required] public int RegistrationId { get; init; }
}