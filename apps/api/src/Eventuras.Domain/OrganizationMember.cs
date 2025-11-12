using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace Eventuras.Domain;

public class OrganizationMember
{
    [Required]
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public string UserId { get; set; }

    public int OrganizationId { get; set; }

    [ForeignKey(nameof(UserId))] public ApplicationUser User { get; set; }

    [ForeignKey(nameof(OrganizationId))] public Organization Organization { get; set; }

    public List<OrganizationMemberRole> Roles { get; set; }

    public bool HasRole(string role) => Roles?.Any(r => r.Role == role) == true;
}
