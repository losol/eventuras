using System.Collections.Generic;

namespace Eventuras.Services.Organizations.Settings
{
    public interface IOrganizationSettingsRegistry
    {
        /// <summary>
        /// Registers new setting in the system.
        /// Admins of the org will be able to select this name
        /// and provide the value for the setting in the UI.
        /// The value provided will be validated according
        /// to the type specified here.  
        /// </summary>
        /// <param name="name">The name of the setting. Required.</param>
        /// <param name="section">The name of the settings section. Required.</param>
        /// <param name="description">The description of the setting. Will be displayed as the label for the input in the UI. Required.</param>
        /// <param name="type">The type of the setting.</param>
        void RegisterSettingAsync(string name, string section, string description, OrganizationSettingType type);

        /// <summary>
        /// Returns all registered organization settings entries.
        /// </summary>
        /// <returns>An array of entries, not <c>null</c>.</returns>
        IEnumerable<OrganizationSettingEntry> GetEntries();
    }
}
