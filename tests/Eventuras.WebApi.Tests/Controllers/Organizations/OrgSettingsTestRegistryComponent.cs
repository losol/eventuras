using Eventuras.Services.Organizations.Settings;

namespace Eventuras.WebApi.Tests.Controllers.Organizations;

internal class OrgSettingsTestRegistryComponent : IOrganizationSettingsRegistryComponent
{
    internal const string Section = "Test";
    internal const string StringKey = "TEST_STRING";
    internal const string NumberKey = "TEST_NUMBER";
    internal const string UrlKey = "TEST_URL";
    internal const string EmailKey = "TEST_EMAIL";
    internal const string BooleanKey = "TEST_BOOL";

    public void RegisterSettings(IOrganizationSettingsRegistry registry)
    {
        registry.RegisterSetting(StringKey, Section, "Testing string", OrganizationSettingType.String);
        registry.RegisterSetting(NumberKey, Section, "Testing number", OrganizationSettingType.Number);
        registry.RegisterSetting(UrlKey, Section, "Testing URL", OrganizationSettingType.Url);
        registry.RegisterSetting(EmailKey, Section, "Testing email", OrganizationSettingType.Email);
        registry.RegisterSetting(BooleanKey, Section, "Testing boolean", OrganizationSettingType.Boolean);
    }
}