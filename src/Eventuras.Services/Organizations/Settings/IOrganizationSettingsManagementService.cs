using Eventuras.Domain;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.Organizations.Settings
{
    public interface IOrganizationSettingsManagementService
    {
        /// <exception cref="Exceptions.DuplicateException">Setting with the given name and org id already exists.</exception>
        /// <exception cref="Exceptions.NotAccessibleException">Can't create settings within the given org.</exception>
        Task CreateOrganizationSettingAsync(OrganizationSetting setting, CancellationToken cancellationToken = default);

        /// <exception cref="Exceptions.DuplicateException">Setting with the given name and org id already exists.</exception>
        /// <exception cref="Exceptions.NotAccessibleException">Can't update settings within the given org.</exception>
        Task UpdateOrganizationSettingAsync(OrganizationSetting setting, CancellationToken cancellationToken = default);

        /// <exception cref="Exceptions.NotAccessibleException">Can't remove settings within the given org.</exception>
        Task RemoveOrganizationSettingAsync(OrganizationSetting setting, CancellationToken cancellationToken = default);
    }
}
