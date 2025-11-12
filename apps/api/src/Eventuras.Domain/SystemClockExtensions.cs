using NodaTime;

namespace Eventuras.Domain;

public static class SystemClockExtensions
{
    public static Instant Now(this SystemClock clock) => clock.GetCurrentInstant();

    public static LocalDate Today(this SystemClock clock) => clock.GetCurrentInstant().ToLocalDate();

    public static string ToString(this LocalDate localDate, string format) => localDate.ToString(format, null);

    public static string ToString(this Instant instant, string format) => instant.ToString(format, null);

    public static LocalDate ToLocalDate(this Instant instant)
    {
        var tz = DateTimeZoneProviders.Bcl.GetSystemDefault();
        return instant.InZone(tz).Date;
    }
}
