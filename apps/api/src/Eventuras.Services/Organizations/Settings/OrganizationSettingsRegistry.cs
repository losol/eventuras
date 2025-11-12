using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using Eventuras.Services.Exceptions;

namespace Eventuras.Services.Organizations.Settings;

public class OrganizationSettingsRegistry : IOrganizationSettingsRegistry
{
    private readonly IDictionary<string, OrganizationSettingEntry> _entries =
        new Dictionary<string, OrganizationSettingEntry>();

    public void RegisterSetting(
        string name,
        string section,
        string description,
        OrganizationSettingType type)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentNullException(nameof(name));
        }

        if (string.IsNullOrWhiteSpace(section))
        {
            throw new ArgumentNullException(nameof(section));
        }

        if (string.IsNullOrWhiteSpace(description))
        {
            throw new ArgumentNullException(nameof(description));
        }

        var key = NormalizeKey(section, name);
        if (_entries.ContainsKey(key))
        {
            throw new DuplicateException($"Duplicate settings key {name} in section {section}");
        }

        _entries.Add(key, new OrganizationSettingEntry(name, section, description, type));
    }

    public void RegisterSettings<T>(string section)
    {
        var type = typeof(T);

        if (string.IsNullOrWhiteSpace(section))
        {
            var typeDisplayName = type.GetCustomAttribute<DisplayNameAttribute>();
            if (typeDisplayName != null)
            {
                section = typeDisplayName.DisplayName;
            }
            else
            {
                section = type.Name;
            }
        }

        foreach (var property in type.GetProperties())
        {
            var settingKey = $"{type.Name}.{property.Name}";
            var orgSettingKey = property.GetCustomAttribute<OrgSettingKeyAttribute>();
            if (orgSettingKey != null)
            {
                settingKey = orgSettingKey.Name;
            }

            var settingDescription = property.Name;
            var propertyDisplayName = property.GetCustomAttribute<DisplayNameAttribute>();
            if (propertyDisplayName != null)
            {
                settingDescription = propertyDisplayName.DisplayName;
            }

            var settingType = GetSettingType(property);
            RegisterSetting(settingKey, section, settingDescription, settingType);
        }
    }

    public IEnumerable<OrganizationSettingEntry> GetEntries() => _entries.Values.ToArray();

    private static OrganizationSettingType GetSettingType(PropertyInfo propertyInfo)
    {
        switch (Type.GetTypeCode(propertyInfo.PropertyType))
        {
            case TypeCode.Byte:
            case TypeCode.SByte:
            case TypeCode.UInt16:
            case TypeCode.UInt32:
            case TypeCode.UInt64:
            case TypeCode.Int16:
            case TypeCode.Int32:
            case TypeCode.Int64:
            case TypeCode.Decimal:
            case TypeCode.Double:
            case TypeCode.Single:
                return OrganizationSettingType.Number;
            case TypeCode.Boolean:
                return OrganizationSettingType.Boolean;
            default:
                if (propertyInfo.GetCustomAttribute<EmailAddressAttribute>() != null)
                {
                    return OrganizationSettingType.Email;
                }

                if (propertyInfo.GetCustomAttribute<UrlAttribute>() != null)
                {
                    return OrganizationSettingType.Url;
                }

                return OrganizationSettingType.String;
        }
    }

    private static string NormalizeKey(string section, string name) =>
        section.Trim().ToLower() + "." + name.Trim().ToLower();
}
