namespace Eventuras.Services.Events
{
    public class EventListRequest : PagingRequest
    {
        public EventListRequest()
        {
        }

        public EventListRequest(int offset, int limit) : base(offset, limit)
        {
        }

        public EventListRequest(PagingRequest request) : base(request)
        {
        }

        public EventInfoFilter Filter { get; set; } = new EventInfoFilter();

        public EventRetrievalOrder Order { get; set; } = EventRetrievalOrder.StartDate;
    }
}
