using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.v3.Organizations
{
    public class OrganizationMemberRoleDto
    {
        public int OrganizationMemberId { get; set; }
        public string Role { get; set; }

        public OrganizationMemberRoleDto() { }

        public OrganizationMemberRoleDto(OrganizationMemberRole role)
        {
            OrganizationMemberId = role.OrganizationMemberId;
            Role = role.Role;
        }
    }
}
