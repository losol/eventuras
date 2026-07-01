using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.v3.Registrations;

public class NewRegistrationDto : RegistrationFormDto
{
    [Required] public Guid? UserId { get; set; }

    [Required][Range(1, int.MaxValue)] public int EventId { get; set; }

    [FromQuery(Name = "createOrder")] public bool CreateOrder { get; set; }

    /// <summary>
    ///     Deprecated and ignored. Replaced by the registration/order confirmation email, which is
    ///     sent automatically based on the registration's status. Kept for backwards compatibility;
    ///     will be removed in the next API version.
    /// </summary>
    [Obsolete("Ignored — replaced by the registration/order confirmation email (sent automatically based on status). Will be removed in the next API version.")]
    public bool SendWelcomeLetter { get; set; } = true;
}
