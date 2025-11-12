using Eventuras.Services.Organizations.Settings;

namespace Eventuras.Services.Twilio;

internal class TwilioSettingsRegistryComponent : IOrganizationSettingsRegistryComponent
{
    public void RegisterSettings(IOrganizationSettingsRegistry registry) =>
        registry.RegisterSettings<OrganizationTwilioSettings>();
}
