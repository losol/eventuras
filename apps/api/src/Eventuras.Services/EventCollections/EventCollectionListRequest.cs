namespace Eventuras.Services.EventCollections;

public class EventCollectionListRequest : PagingRequest
{
    public EventCollectionListRequest(int offset, int limit) : base(offset, limit) { }

    public EventCollectionFilter Filter { get; set; } = new();

    public EventCollectionOrder Order { get; set; } = EventCollectionOrder.Name;

    public bool Descending { get; set; }
}
