namespace Eventuras.Services.Events
{
    public class EventInfoRetrievalOptions
    {
        public bool LoadOrganization { get; set; }
        public bool LoadOrganizationMembers { get; set; }
        public bool LoadOrganizerUser { get; set; }
        public bool LoadProducts { get; set; }
        public bool LoadRegistrations { get; set; }
    }
}
