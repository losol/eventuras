namespace Eventuras.Services.Organizations
{
    public class OrganizationFilter
    {
        public bool IncludeInactive { get; set; }
        public bool InactiveOnly { get; set; }
        public bool ParentOnly { get; set; }
    }
}
