namespace Eventuras.WebApi.Config;

public class AppSettings
{
    public string AllowedOrigins { get; set; }
    public string DataProtectionKeysFolder { get; set; }

    /// <summary>
    ///     IANA time zone ID used to render wall-clock timestamps (e.g.
    ///     RegistrationTime) to API clients. Defaults to Europe/Oslo.
    /// </summary>
    public string TimeZone { get; set; } = "Europe/Oslo";
}
