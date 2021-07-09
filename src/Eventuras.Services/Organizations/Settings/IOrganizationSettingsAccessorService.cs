using System.Threading.Tasks;

namespace Eventuras.Services.Organizations.Settings
{
    public interface IOrganizationSettingsAccessorService
    {
        /// <summary>
        /// Retrieves the org-level setting value. 
        /// </summary>
        /// <param name="name">Org setting name. Not <c>null</c></param>
        /// <returns>Setting value or <c>null</c> if no current org is determined or no setting exists.</returns>
        Task<string> GetOrganizationSettingByNameAsync(string name);
    }
}
