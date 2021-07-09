using System;
using System.Linq;
using System.Threading.Tasks;

namespace Eventuras.Services.Organizations.Settings
{
    public class OrganizationSettingsAccessorService : IOrganizationSettingsAccessorService
    {
        private readonly IOrganizationSettingsCache _organizationSettingsCache;
        private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;

        public OrganizationSettingsAccessorService(
            ICurrentOrganizationAccessorService currentOrganizationAccessorService,
            IOrganizationSettingsCache organizationSettingsCache)
        {
            _currentOrganizationAccessorService = currentOrganizationAccessorService ?? throw
                new ArgumentNullException(nameof(currentOrganizationAccessorService));

            _organizationSettingsCache = organizationSettingsCache ?? throw
                new ArgumentNullException(nameof(organizationSettingsCache));
        }

        public async Task<string> GetOrganizationSettingByNameAsync(string name)
        {
            var org = await _currentOrganizationAccessorService.GetCurrentOrganizationAsync();
            if (org == null)
            {
                return null;
            }

            var settings = await _organizationSettingsCache.GetAllSettingsForOrganizationAsync(org.OrganizationId);
            return settings.FirstOrDefault(s => s.Name == name)?.Value;
        }
    }
}
