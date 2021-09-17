namespace Eventuras.WebApi.Controllers.Orders
{
    public class OrderLineUpdateDto
    {
        public int ProductId { get; set; }

        public int? ProductVariantId { get; set; }

        public int Quantity { get; set; }
    }
}
