using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace losol.EventManagement.Domain
{


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
		public bool IsRefund => RefundOrderId.HasValue;

		/// <summary>
		/// A string that uniquely identifies a product-variant combination
		/// </summary>
		public string ItemCode
		{
			get
			{
                var prefix = IsRefund ? "R" : "K";
				return ProductVariantId.HasValue ? $"{prefix}{ProductId}-{ProductVariantId}" : $"{prefix}{ProductId}";
			}
		}

		public decimal Price { get; set; } // TODO: Change this to PricePerUnit
		public decimal VatPercent { get; set; } = 0;
        public decimal TotalAmount => (Price + Price * VatPercent * 0.01m) * Quantity;

		public string Comments { get; set; }

		// Navigational properties
		[InverseProperty("OrderLines")]
		public Order Order { get; set; }
		public Product Product { get; set; }
		public ProductVariant ProductVariant { get; set; }

		public OrderLine CreateRefundOrderLine()
		{
			return new OrderLine
			{
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

	}
}
