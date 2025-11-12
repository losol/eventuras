namespace Eventuras.Services.Events;

public class EventListRequest : PagingRequest
{
    public EventListRequest(int offset, int limit) : base(offset, limit) { }

    public EventInfoFilter Filter { get; init; } = new();
}
