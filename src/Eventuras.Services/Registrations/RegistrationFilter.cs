using Eventuras.Domain;

namespace Eventuras.Services.Registrations
{
    public class RegistrationFilter
    {
        public int? EventInfoId { get; set; }

        public int[] ProductIds { get; set; }

        public string UserId { get; set; }

        public bool VerifiedOnly { get; set; }

        public bool ActiveUsersOnly { get; set; }

        public bool HavingEmailConfirmedOnly { get; set; }

        public bool AccessibleOnly { get; set; }

        public Registration.RegistrationStatus[] HavingStatuses { get; set; }

        public Registration.RegistrationType[] HavingTypes { get; set; }
    }
}
