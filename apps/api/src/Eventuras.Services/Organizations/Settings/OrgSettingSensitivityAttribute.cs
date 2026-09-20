using System;

namespace Eventuras.Services.Organizations.Settings;

/// <summary>
///     Classifies a property registered through <see cref="IOrganizationSettingsRegistry.RegisterSettings{T}" />.
///     Unannotated properties are <see cref="OrganizationSettingSensitivity.Internal" />.
/// </summary>
[AttributeUsage(AttributeTargets.Property)]
public class OrgSettingSensitivityAttribute : Attribute
{
    public OrgSettingSensitivityAttribute(OrganizationSettingSensitivity sensitivity) =>
        Sensitivity = sensitivity;

    public OrganizationSettingSensitivity Sensitivity { get; }
}
