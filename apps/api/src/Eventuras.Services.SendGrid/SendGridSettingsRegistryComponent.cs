using Eventuras.Services.Organizations.Settings;

namespace Eventuras.Services.SendGrid;

internal class SendGridSettingsRegistryComponent : IOrganizationSettingsRegistryComponent
{
    public void RegisterSettings(IOrganizationSettingsRegistry registry) =>
        registry.RegisterSettings<OrganizationSendGridSettings>();
}
