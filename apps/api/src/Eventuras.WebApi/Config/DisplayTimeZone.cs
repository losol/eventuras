#nullable enable

using NodaTime;

namespace Eventuras.WebApi.Config;

/// <summary>
///     Ambient display time zone used when converting stored Instant values to
///     LocalDateTime for API responses. Set once at startup from AppSettings.
/// </summary>
public static class DisplayTimeZone
{
    public static DateTimeZone Current { get; private set; } = DateTimeZoneProviders.Tzdb["Europe/Oslo"];

    /// <summary>
    ///     Applies the given IANA time zone id. Returns <c>false</c> when the
    ///     caller passes a non-empty id that cannot be resolved, so Program.cs
    ///     can log instead of silently falling back to the default.
    /// </summary>
    public static bool Configure(string? ianaId)
    {
        if (string.IsNullOrWhiteSpace(ianaId))
        {
            return true;
        }

        var zone = DateTimeZoneProviders.Tzdb.GetZoneOrNull(ianaId);
        if (zone == null)
        {
            return false;
        }

        Current = zone;
        return true;
    }
}
