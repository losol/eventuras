namespace Eventuras.Services.Organizations
{
    public class OrganizationRetrievalOptions
    {
        public bool LoadMembers { get; set; }

        public bool LoadHostnames { get; set; }
        
        public bool LoadSettings { get; set; }
    }
}
