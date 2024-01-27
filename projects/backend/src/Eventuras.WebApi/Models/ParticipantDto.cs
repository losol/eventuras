using Eventuras.Domain;
using System.Linq;

namespace Eventuras.WebApi.Models
{
    public class ParticipantDto
    {
        public ParticipantDto(ApplicationUser user)
        {
            // TODO Split name in applicationUser
            var parts = user.Name.Split(' ');
            var familyName = parts.LastOrDefault();
            var givenName = string.Join(" ", parts.Take(parts.Length - 1));

            this.UserId = user.Id;
            this.FirstName = givenName;
            this.LastName = familyName;

            this.PhoneNumber = user.PhoneNumber;
            this.Email = user.Email;
        }

        public string UserId { get; set; }
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
    }
}

