namespace Eventuras.Services.EventCollections
{
    public class EventCollectionListRequest
    {
        public EventCollectionFilter Filter { get; set; } = new EventCollectionFilter();

        public EventCollectionOrder Order { get; set; } = EventCollectionOrder.Name;

        public bool Descending { get; set; }
    }
}
