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
		public bool IsRefund => RefundOrderId.HasValue;

		/// <summary>
		/// A string that uniquely identifies a product-variant combination
		/// </summary>
		public string ItemCode => ProductVariantId.HasValue ? $"K{ProductId}-{ProductVariantId}" : $"K{ProductId}";

		public decimal Price { get; set; }
		public decimal VatPercent { get; set; } = 0;

		public string Comments { get; set; }

		// Navigational properties
		[InverseProperty("OrderLines")]
		public Order Order { get; set; }
		public Product Product { get; set; }
		public ProductVariant ProductVariant { get; set; }

		public static OrderLine CreateRefundOrderLine(Order forOrder)
		{
			return new OrderLine
			{
				RefundOrderId = forOrder.OrderId,
				ProductName = $"Refund for Order #{forOrder.OrderId}",
				Price = -forOrder.OrderLines.Sum(l => (l.Price + l.Price * l.VatPercent * 0.01m) * l.Quantity)
			};
		}

	}
}
