using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.v3.Organizations
{
    public class OrganizationMemberDto
    {
        public int Id { get; set; }

        public string UserId { get; set; }

        public int OrganizationId { get; set; }

        public List<OrganizationMemberRoleDto> Roles { get; set; }


        public OrganizationMemberDto(OrganizationMember organizationMember)
        {
            if (organizationMember == null) throw new System.ArgumentNullException(nameof(organizationMember));

            Id = organizationMember.Id;
            UserId = organizationMember.UserId;
            OrganizationId = organizationMember.OrganizationId;
            Roles = organizationMember.Roles?.Select(role => new OrganizationMemberRoleDto(role)).ToList() ?? new List<OrganizationMemberRoleDto>();
        }

    }
}
