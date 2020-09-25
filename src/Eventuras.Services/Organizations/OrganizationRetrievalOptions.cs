namespace Eventuras.Services.Organizations
{
    public class OrganizationRetrievalOptions
    {
        public bool LoadParentOrganization { get; set; }
        public bool LoadChildOrganizations { get; set; }
        public bool LoadMembers { get; set; }
    }
}
