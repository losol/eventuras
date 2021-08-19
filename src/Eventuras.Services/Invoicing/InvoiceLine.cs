namespace Eventuras.Services.Invoicing
{
    public class InvoiceLine
    {
        public InvoiceLineType Type { get; set; } = InvoiceLineType.Product;
        public string Description { get; set; }

        public string ProductCode { get; set; }
        public string ProductDescription { get; set; }
        public int? Quantity { get; set; }

        public decimal? Price { get; set; }
        public decimal? Total { get; set; }
        public string Currency { get; set; } = "nok"; // TODO: read this from config
    }
}
