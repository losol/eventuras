using System.ComponentModel.DataAnnotations;

namespace Eventuras.WebApi.Controllers.Registrations
{
    public class RegistrationOrderDto
    {
        [Required]
        [MinLength(1)]
        public RegistrationOrderItemDto[] Items { get; set; }
    }
}
