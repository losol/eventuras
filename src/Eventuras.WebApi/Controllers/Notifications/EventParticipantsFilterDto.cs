using Eventuras.Domain;
using System.ComponentModel.DataAnnotations;

namespace Eventuras.WebApi.Controllers.Notifications
{
    public class EventParticipantsFilterDto
    {
        [Range(1, int.MaxValue)] public int? EventId { get; set; }

        [Range(1, int.MaxValue)] public int? ProductId { get; set; }

        public Registration.RegistrationStatus[] RegistrationStatuses { get; set; }

        public Registration.RegistrationType[] RegistrationTypes { get; set; }

        public bool IsDefined => EventId.HasValue || ProductId.HasValue;
    }
}