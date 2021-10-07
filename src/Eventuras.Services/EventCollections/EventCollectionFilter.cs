namespace Eventuras.Services.EventCollections
{
    public class EventCollectionFilter
    {
        public int? EventInfoId { get; set; }
        
        public bool IncludeArchived { get; set; }
    }
}
