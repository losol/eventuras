using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace Eventuras.Domain;

public class Organization
{
    public int OrganizationId { get; set; }

    [Required]
    public string Name { get; set; }

    [StringLength(300)]
    public string Description { get; set; }

    [StringLength(300)]
    public string Url { get; set; }

    [StringLength(100)]
    public string Phone { get; set; }

    [StringLength(300)]
    public string Email { get; set; }

    [StringLength(300)]
    public string LogoUrl { get; set; }

    public string LogoBase64 { get; set; }

    public string VatId { get; set; }
    public string AccountNumber { get; set; }

    public bool IsRoot { get; set; }

    public bool Active { get; set; } = true;

    public List<OrganizationMember> Members { get; set; }

    public List<OrganizationHostname> Hostnames { get; set; }

    public List<OrganizationSetting> Settings { get; set; }

    [NotMapped]
    public string NameAndHostname =>
        Hostnames?.Any(h => h.Active) == true
            ? $"{Name} ({CommaSeparatedHostnames})"
            : Name;

    [NotMapped]
    public string CommaSeparatedHostnames => string.Join(",",
        Hostnames?.Where(h => h.Active)
            .Select(h => h.Hostname)
            .ToList()
        ?? new List<string>());

    public string GetSettingValue(string name)
    {
        if (name == null)
        {
            throw new ArgumentNullException(nameof(name));
        }

        return Settings?.FirstOrDefault(s => s.Name == name)?.Value;
    }
}
