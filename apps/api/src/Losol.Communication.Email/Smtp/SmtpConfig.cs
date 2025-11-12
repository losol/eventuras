using System.ComponentModel.DataAnnotations;

namespace Losol.Communication.Email.Smtp;

public class SmtpConfig
{
    [Required] public string Host { get; set; }

    public int Port { get; set; } = 587;

    [Required] public string FromEmail { get; set; }

    public string FromName { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
}
