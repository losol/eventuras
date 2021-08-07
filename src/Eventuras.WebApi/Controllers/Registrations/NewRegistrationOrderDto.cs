using System.ComponentModel.DataAnnotations;

namespace Eventuras.WebApi.Controllers.Registrations
{
    public class NewRegistrationOrderDto
    {
        [Required] [MinLength(1)] public NewRegistrationOrderItemDto[] Items { get; set; }
    }
}