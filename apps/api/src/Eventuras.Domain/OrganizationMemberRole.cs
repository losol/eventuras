using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Eventuras.Domain;

public class OrganizationMemberRole
{
    public int OrganizationMemberId { get; set; }

    [Required] public string Role { get; set; }

    [ForeignKey(nameof(OrganizationMemberId))]
    public OrganizationMember OrganizationMember { get; set; }
}
