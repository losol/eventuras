using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Eventuras.Domain;

public class OrganizationHostname
{
    public int OrganizationId { get; set; }

    [Required]
    [StringLength(300)]
    public string Hostname { get; set; }

    public bool Active { get; set; } = true;

    [ForeignKey(nameof(OrganizationId))]
    public Organization Organization { get; set; }

    public override string ToString()
    {
        return Hostname;
    }
}
