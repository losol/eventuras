namespace Eventuras.Services.Organizations.Settings;

public class OrganizationSettingEntry
{
    public OrganizationSettingEntry(
        string name,
        string section,
        string description,
        OrganizationSettingType type)
    {
        Name = name;
        Section = section;
        Description = description;
        Type = type;
    }

    public string Name { get; }

    public string Section { get; }

    public string Description { get; }

    public OrganizationSettingType Type { get; }
}
