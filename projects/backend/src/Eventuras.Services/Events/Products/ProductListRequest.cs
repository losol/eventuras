namespace Eventuras.Services.Events.Products
{
    public sealed class ProductListRequest
    {
        public int EventInfoId { get; }

        public ProductFilter Filter { get; set; } = ProductFilter.Default;

        public ProductRetrievalOrder Order { get; set; } = ProductRetrievalOrder.Name;

        public bool Descending { get; set; }

        public ProductListRequest(int eventInfoId)
        {
            EventInfoId = eventInfoId;
        }
    }
}
