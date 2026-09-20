using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Eventuras.Domain;

public class OrganizationSetting
{
    public Guid Uuid { get; set; } = Guid.CreateVersion7();

    public int OrganizationId { get; set; }

    public string Name { get; set; }

    public string Value { get; set; }

    [ForeignKey(nameof(OrganizationId))] public Organization Organization { get; set; }
}
