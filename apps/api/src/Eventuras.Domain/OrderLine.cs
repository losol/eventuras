using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Eventuras.Domain;



public class OrderLine
{
    [Required]
    public int OrderLineId { get; set; }
    [Required, ForeignKey("Order")]
    public int OrderId { get; set; }

    public int? ProductId { get; set; }
    public int? ProductVariantId { get; set; }
    public int Quantity { get; set; } = 1;

    public string ProductName { get; set; }
    public string ProductDescription { get; set; }

    public string ProductVariantName { get; set; }
    public string ProductVariantDescription { get; set; }

    public int? RefundOrderId { get; private set; }
    public Order RefundOrder { get; private set; }
    public int? RefundOrderLineId { get; private set; }
    public OrderLine RefundOrderLine { get; private set; }
    public bool IsRefund => Quantity < 0;

    /// <summary>
    /// A string that uniquely identifies a product-variant combination
    /// </summary>
    public string ItemCode =>
        ProductVariantId.HasValue ? $"K{ProductId}-{ProductVariantId}" : $"K{ProductId}";

    /// <summary>
    /// A string which combines product and productvariant name
    /// </summary>
    public string ItemName =>
        !string.IsNullOrWhiteSpace(ProductVariantName) ? $"{ProductName} ({ProductVariantName})" : $"{ProductName}";


    public decimal Price { get; set; }

    public decimal VatPercent { get; set; } = 0;

    public decimal LineTotal => (Price + Price * VatPercent * 0.01m) * Quantity;

    public string Comments { get; set; }

    // Navigational properties
    [InverseProperty("OrderLines")]
    public Order Order { get; set; }
    public Product Product { get; set; }
    public ProductVariant ProductVariant { get; set; }

    public OrderLine()
    {
    }

    public OrderLine(Product product, int quantity, ProductVariant variant = null)
    {
        if (product == null)
        {
            throw new ArgumentNullException(nameof(product));
        }

        if (quantity == 0)
        {
            throw new ArgumentException($"{nameof(quantity)} must be a non-zero value");
        }

        if (variant != null && variant.ProductId != product.ProductId)
        {
            throw new ArgumentException(
                $"Product variant {variant.ProductVariantId} doesn't belong to product {product.ProductId}");
        }

        ProductId = product.ProductId;
        ProductVariantId = variant?.ProductVariantId;
        Product = product;
        ProductVariant = variant;

        Price = variant?.Price ?? product.Price;
        VatPercent = variant?.VatPercent ?? product.VatPercent;
        Quantity = quantity;

        ProductName = product.Name;
        ProductDescription = product.Description;

        ProductVariantName = variant?.Name;
        ProductVariantDescription = variant?.Description;
    }

    public OrderLine CreateRefundOrderLine()
    {
        if (IsRefund)
        {
            throw new InvalidOperationException("Cannot create a refund orderline for a refund orderline.");
        }
        return new OrderLine
        {
            OrderId = OrderId,
            RefundOrderId = OrderId,
            RefundOrderLineId = OrderLineId,
            ProductName = $"Korreksjon for {ProductName} (Order #{OrderId})",
            Price = Price,
            Quantity = -Quantity,
            VatPercent = VatPercent,
            ProductId = ProductId,
            ProductVariantId = ProductVariantId
        };
    }

    public override string ToString() => $"{ItemCode}×{Quantity}";

}
