using Eventuras.Services.Organizations.Settings;

namespace Eventuras.Services.Zoom.Client;

public class ZoomSettingsRegistryComponent : IOrganizationSettingsRegistryComponent
{
    public void RegisterSettings(IOrganizationSettingsRegistry registry)
    {
        registry.RegisterSetting(ZoomConstants.ZoomApiKeySettingKey,
            ZoomConstants.ZoomSectionName,
            ZoomConstants.ZoomApiKeySettingDescription,
            OrganizationSettingType.String);

        registry.RegisterSetting(ZoomConstants.ZoomApiSecretSettingKey,
            ZoomConstants.ZoomSectionName,
            ZoomConstants.ZoomApiSecretSettingDescription,
            OrganizationSettingType.String);
    }
}