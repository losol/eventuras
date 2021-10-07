namespace Eventuras.Services.Registrations
{
    public class RegistrationRetrievalOptions
    {
        public bool ForUpdate { get; set; }
        public bool LoadUser { get; set; }
        public bool LoadEventInfo { get; set; }
        public bool LoadOrders { get; set; }
        public bool LoadProducts { get; set; }

        /// <summary>
        /// Just a helpful shortcut for retrieving registrations
        /// with user and event info loaded.
        /// </summary>
        public static readonly RegistrationRetrievalOptions UserAndEvent =
            new RegistrationRetrievalOptions
            {
                LoadUser = true,
                LoadEventInfo = true
            };

        public static readonly RegistrationRetrievalOptions RegistrationInfoOnly =
            new RegistrationRetrievalOptions();

        public static readonly RegistrationRetrievalOptions Default = RegistrationInfoOnly;
    }
}
