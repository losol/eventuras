using System.Threading.Tasks;

namespace Eventuras.Services.Organizations.Settings;

public interface IOrganizationSettingsAccessorService
{
    /// <summary>
    ///     Retrieves the org-level setting value.
    /// </summary>
    /// <param name="name">Org setting name. Not <c>null</c></param>
    /// <returns>Setting value or <c>null</c> if no current org is determined or no setting exists.</returns>
    Task<string> GetOrganizationSettingByNameAsync(string name);

    /// <summary>
    ///     Reads settings as a POCO.
    ///     POCO properties could be annotated with <see cref="OrgSettingKeyAttribute" />
    ///     to map them to setting values. Otherwise POCO type name + property name will be used
    ///     as a setting keys.
    /// </summary>
    /// <typeparam name="T">The resulting POCO type.</typeparam>
    /// <returns>POCO filled with org setting values and validated using its data annotations.</returns>
    /// <exception cref="System.ComponentModel.DataAnnotations.ValidationException"></exception>
    Task<T> ReadOrganizationSettingsAsync<T>(int? organizationId = null);
}
