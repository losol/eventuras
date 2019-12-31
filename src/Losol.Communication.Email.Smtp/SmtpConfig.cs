using System.ComponentModel.DataAnnotations;

namespace Losol.Communication.Email.Smtp
{
    public class SmtpConfig
    {
        [Required]
        public string Host { get; set; }
        public int Port { get; set; } = 587;
        [Required]
        public string From { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
