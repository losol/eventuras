using Eventuras.Services.ExternalSync;

namespace Eventuras.Services.Zoom;

internal class InvalidZoomMeetingIdException : ExternalSyncException
{
    public InvalidZoomMeetingIdException(string externalEventId) : base($"Invalid meeting id format: {externalEventId} (integer expected)") { }
}