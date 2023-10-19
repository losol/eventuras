using Eventuras.Domain;
using System.Threading.Tasks;

namespace Eventuras.Services.Organizations.Settings
{
    public interface IOrganizationSettingsCache
    {
        Task<OrganizationSetting[]> GetAllSettingsForOrganizationAsync(int organizationId);

        void InvalidateCacheForOrganization(int organizationId);
    }
}
