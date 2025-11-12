using System.Collections.Generic;

namespace Eventuras.Services.Organizations.Settings;

public interface IOrganizationSettingsRegistry
{
    /// <summary>
    ///     Registers new setting in the system.
    ///     Admins of the org will be able to select this name
    ///     and provide the value for the setting in the UI.
    ///     The value provided will be validated according
    ///     to the type specified here.
    /// </summary>
    /// <param name="name">The name of the setting. Required.</param>
    /// <param name="section">The name of the settings section. Required.</param>
    /// <param name="description">
    ///     The description of the setting. Will be displayed as the label for the input in the UI.
    ///     Required.
    /// </param>
    /// <param name="type">The type of the setting.</param>
    void RegisterSetting(string name, string section, string description, OrganizationSettingType type);

    /// <summary>
    ///     Register all properties of the specified type as an organization settings.
    ///     Use <see cref="System.ComponentModel.DisplayNameAttribute" /> to provide
    ///     human-friendly description for each property. If no <c>section</c> param is provided,
    ///     then it tries to read section name from <see cref="System.ComponentModel.DisplayNameAttribute" />
    ///     applied to the given type. If type is not annotated with the display name attribute,
    ///     then the type name itself will be used as a section name.
    /// </summary>
    /// <param name="section">The optional name of the settings section.</param>
    void RegisterSettings<T>(string section = null);

    /// <summary>
    ///     Returns all registered organization settings entries.
    /// </summary>
    /// <returns>An array of entries, not <c>null</c>.</returns>
    IEnumerable<OrganizationSettingEntry> GetEntries();
}
