using System.ComponentModel.DataAnnotations;

namespace Losol.Communication.Email.SendGrid;

public class SendGridConfig
{
    [Required] public string Key { get; set; }

    [Required] public string EmailAddress { get; set; }

    [Required] public string Name { get; set; }
}
