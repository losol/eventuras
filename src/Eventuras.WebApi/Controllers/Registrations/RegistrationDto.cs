using Eventuras.Domain;
using Eventuras.WebApi.Controllers.Users;
using Eventuras.WebApi.Models;

namespace Eventuras.WebApi.Controllers.Registrations
{
    public class RegistrationDto
    {
        public int RegistrationId { get; set; }
        public int EventId { get; set; }
        public string UserId { get; set; }
        public Registration.RegistrationStatus Status { get; set; }
        public Registration.RegistrationType Type { get; set; }
        public int? CertificateId { get; set; }
        public string Notes { get; set; }
        public UserDto User { get; set; }
        public EventDto Event { get; set; }

        public RegistrationDto(Registration registration)
        {
            RegistrationId = registration.RegistrationId;
            EventId = registration.EventInfoId;
            UserId = registration.UserId;
            Status = registration.Status;
            Type = registration.Type;
            Notes = registration.Notes;
            if (registration.User != null)
            {
                User = new UserDto(registration.User);
            }

            if (registration.EventInfo != null)
            {
                Event = new EventDto(registration.EventInfo);
            }
        }
    }
}