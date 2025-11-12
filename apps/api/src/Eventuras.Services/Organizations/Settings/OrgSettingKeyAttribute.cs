using System;

namespace Eventuras.Services.Organizations.Settings;

public class OrgSettingKeyAttribute : Attribute
{
    public OrgSettingKeyAttribute(string name) => Name = name;
    public string Name { get; }
}
