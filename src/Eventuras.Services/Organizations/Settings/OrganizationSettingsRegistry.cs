using System;
using System.Collections.Generic;
using System.Linq;
using Eventuras.Services.Exceptions;

namespace Eventuras.Services.Organizations.Settings
{
    public class OrganizationSettingsRegistry : IOrganizationSettingsRegistry
    {
        private readonly IDictionary<string, OrganizationSettingEntry> _entries =
            new Dictionary<string, OrganizationSettingEntry>();

        public void RegisterSettingAsync(
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

        public IEnumerable<OrganizationSettingEntry> GetEntries()
        {
            return _entries.Values.ToArray();
        }

        private static string NormalizeKey(string section, string name)
        {
            return section.Trim().ToLower() + "." + name.Trim().ToLower();
        }
    }
}
