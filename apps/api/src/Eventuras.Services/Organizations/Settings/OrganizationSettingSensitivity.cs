namespace Eventuras.Services.Organizations.Settings;

/// <summary>
///     How freely a setting's value may be handed out. The API reads this when
///     it builds a response: a <see cref="Secret" /> value never leaves the server.
/// </summary>
public enum OrganizationSettingSensitivity
{
    /// <summary>Safe for anyone to see, signed in or not.</summary>
    Public = 1,

    /// <summary>Configuration the organization's admins may read. The default.</summary>
    Internal,

    /// <summary>A credential. Reported as set or not set, never read back.</summary>
    Secret
}
