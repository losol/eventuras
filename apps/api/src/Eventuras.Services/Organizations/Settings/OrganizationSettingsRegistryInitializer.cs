using System;
using System.Collections.Generic;
using System.Linq;

namespace Eventuras.Services.Organizations.Settings;

public class OrganizationSettingsRegistryInitializer : IStartupService
{
    private readonly IOrganizationSettingsRegistry _registry;
    private readonly IOrganizationSettingsRegistryComponent[] _components;

    public OrganizationSettingsRegistryInitializer(
        IOrganizationSettingsRegistry registry,
        IEnumerable<IOrganizationSettingsRegistryComponent> components)
    {
        _registry = registry ?? throw
            new ArgumentNullException(nameof(registry));

        _components = components?.ToArray() ?? throw
            new ArgumentNullException(nameof(components));
    }

    public void OnStartup()
    {
        foreach (var component in _components)
        {
            component.RegisterSettings(_registry);
        }
    }
}
