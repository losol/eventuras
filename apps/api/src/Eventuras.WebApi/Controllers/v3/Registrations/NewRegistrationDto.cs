using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.v3.Registrations;

public class NewRegistrationDto : RegistrationFormDto
{
    [Required] public string UserId { get; set; }

    [Required] [Range(1, int.MaxValue)] public int EventId { get; set; }

    [FromQuery(Name = "createOrder")] public bool CreateOrder { get; set; }

    public bool SendWelcomeLetter { get; set; } = true;
}
