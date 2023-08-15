using System.ComponentModel.DataAnnotations;

namespace Eventuras.Services.TalentLms;

internal class TalentLmsUserSignUpRequest
{
    [Required]
    public string FirstName { get; set; }

    [Required]
    public string LastName { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    public string Login { get; set; }

    [Required]
    public string Password { get; set; }
}