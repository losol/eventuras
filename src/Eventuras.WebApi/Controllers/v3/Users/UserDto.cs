using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.Users
{
    public class UserDto
    {
        public string Id { get; set; }

        public string Name { get; set; }

        public string Email { get; set; }

        public string PhoneNumber { get; set; }

        public UserDto()
        {
        }

        public UserDto(ApplicationUser user)
        {
            Id = user.Id;
            Name = user.Name;
            Email = user.Email;
            PhoneNumber = user.PhoneNumber;
        }
    }
}
