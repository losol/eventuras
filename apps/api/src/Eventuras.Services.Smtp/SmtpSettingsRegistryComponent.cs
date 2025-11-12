using Eventuras.Services.Organizations.Settings;

namespace Eventuras.Services.Smtp;

internal class SmtpSettingsRegistryComponent : IOrganizationSettingsRegistryComponent
{
    public void RegisterSettings(IOrganizationSettingsRegistry registry) =>
        registry.RegisterSettings<OrganizationSmtpSettings>();
}
