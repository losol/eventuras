using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Organizations.Settings;

public interface IOrganizationSettingsCache
{
    Task<OrganizationSetting[]> GetAllSettingsForOrganizationAsync(int organizationId);

    void InvalidateCacheForOrganization(int organizationId);
}