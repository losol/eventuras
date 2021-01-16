namespace Eventuras.Services.Registrations
{
    public class RegistrationRetrievalOptions
    {
        public bool IncludeUser { get; set; }
        public bool IncludeEventInfo { get; set; }
        public bool IncludeOrders { get; set; }
        public bool IncludeProducts { get; set; }

        /// <summary>
        /// Just a helpful shortcut for retrieving registrations
        /// with user and event info loaded.
        /// </summary>
        public static readonly RegistrationRetrievalOptions UserAndEvent =
            new RegistrationRetrievalOptions
            {
                IncludeUser = true,
                IncludeEventInfo = true
            };

        public static readonly RegistrationRetrievalOptions RegistrationInfoOnly =
            new RegistrationRetrievalOptions();

        public static readonly RegistrationRetrievalOptions Default = RegistrationInfoOnly;
    }
}
