using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.v3.Organizations;

public class OrganizationMemberRoleDto
{
    public OrganizationMemberRoleDto() { }

    public OrganizationMemberRoleDto(OrganizationMemberRole role)
    {
        OrganizationMemberId = role.OrganizationMemberId;
        Role = role.Role;
    }

    public int OrganizationMemberId { get; set; }
    public string Role { get; set; }
}
