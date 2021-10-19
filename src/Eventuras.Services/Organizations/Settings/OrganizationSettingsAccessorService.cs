using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
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

        public async Task<T> ReadOrganizationSettingsAsync<T>()
        {
            var org = await _currentOrganizationAccessorService
                .RequireCurrentOrganizationAsync();

            var settings = await _organizationSettingsCache
                .GetAllSettingsForOrganizationAsync(org.OrganizationId);

            var settingsMap = settings
                .ToDictionary(s => s.Name, s => s.Value);

            var type = typeof(T);
            var poco = Activator.CreateInstance<T>();
            foreach (var property in type.GetProperties())
            {
                var settingKey = $"{type.Name}.{property.Name}";
                var orgSettingKey = property.GetCustomAttribute<OrgSettingKeyAttribute>();
                if (orgSettingKey != null)
                {
                    settingKey = orgSettingKey.Name;
                }

                if (settingsMap.ContainsKey(settingKey))
                {
                    var settingValue = settingsMap[settingKey];
                    property.SetValue(poco, Convert.ChangeType(settingValue, property.PropertyType));
                }
            }

            if (poco is not IConfigurableSettings { Enabled: false })
            {
                Validator.ValidateObject(poco,
                    new ValidationContext(poco, serviceProvider: null, items: null),
                    true);
            }

            return poco;
        }
    }
}
