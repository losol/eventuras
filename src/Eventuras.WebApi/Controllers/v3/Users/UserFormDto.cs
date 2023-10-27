using Eventuras.Domain;
using System.ComponentModel.DataAnnotations;

namespace Eventuras.WebApi.Controllers.Users
{
    public class UserFormDto
    {
        [Required]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Phone]
        public string PhoneNumber { get; set; }

        public void CopyTo(ApplicationUser user)
        {
            user.Name = Name;
            user.Email = Email;
            user.PhoneNumber = PhoneNumber;
        }
    }
}
