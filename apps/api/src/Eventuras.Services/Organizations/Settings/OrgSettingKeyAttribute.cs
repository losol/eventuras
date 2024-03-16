using System;

namespace Eventuras.Services.Organizations.Settings;

public class OrgSettingKeyAttribute : Attribute
{
    public string Name { get; }

    public OrgSettingKeyAttribute(string name)
    {
        Name = name;
    }
}
