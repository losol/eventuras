using Eventuras.Services.Organizations.Settings;

namespace Eventuras.Services.PowerOffice;

public class PowerOfficeSettingsRegistryComponent : IOrganizationSettingsRegistryComponent
{
    public void RegisterSettings(IOrganizationSettingsRegistry registry)
    {
        registry
            .RegisterSetting(PowerOfficeConstants.ApplicationKey,
                PowerOfficeConstants.SectionName,
                PowerOfficeConstants.ApplicationKeyDescription,
                OrganizationSettingType.String);

        registry
            .RegisterSetting(PowerOfficeConstants.ClientKey,
                PowerOfficeConstants.SectionName,
                PowerOfficeConstants.ClientKeyDescription,
                OrganizationSettingType.String);
    }
}
