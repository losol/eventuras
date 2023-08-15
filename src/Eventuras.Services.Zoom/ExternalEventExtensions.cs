using Eventuras.Domain;

namespace Eventuras.Services.Zoom;

internal static class ExternalEventExtensions
{
    public static bool TryGetZoomMeetingId(this ExternalEvent externalEvent, out long meetingId)
    {
        var externalEventId = externalEvent.ExternalEventId.Replace(" ", "");
        return long.TryParse(externalEventId, out meetingId);
    }

    public static long GetZoomMeetingId(this ExternalEvent externalEvent)
    {
        if (!TryGetZoomMeetingId(externalEvent, out var meetingId)) throw new InvalidZoomMeetingIdException(externalEvent.ExternalEventId);

        return meetingId;
    }
}