namespace Eventuras.Services.Registrations
{
    public class RegistrationFilter
    {
        public int? EventInfoId { get; set; }

        public string UserId { get; set; }

        public bool VerifiedOnly { get; set; }

        public bool ActiveUsersOnly { get; set; }

        public bool HavingEmailConfirmedOnly { get; set; }

        public bool AccessibleOnly { get; set; }
    }
}