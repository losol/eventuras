namespace Eventuras.Services.Organizations.Settings;

public class OrganizationSettingEntry
{
    public OrganizationSettingEntry(
        string name,
        string section,
        string description,
        OrganizationSettingType type,
        OrganizationSettingSensitivity sensitivity = OrganizationSettingSensitivity.Internal)
    {
        Name = name;
        Section = section;
        Description = description;
        Type = type;
        Sensitivity = sensitivity;
    }

    public string Name { get; }

    public string Section { get; }

    public string Description { get; }

    public OrganizationSettingType Type { get; }

    public OrganizationSettingSensitivity Sensitivity { get; }
}
