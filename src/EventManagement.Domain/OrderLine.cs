using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace losol.EventManagement.Domain
{


	public class OrderLine
	{
		[Required]
		public int OrderLineId { get; set; }
		[Required]
		public int OrderId { get; set; }

		public int? ProductId { get; set; }
		public int? ProductVariantId { get; set; }
		public int Quantity { get; set; } = 1;

		public string ProductName { get; set; }
		public string ProductDescription { get; set; }

		public string ProductVariantName { get; set; }
		public string ProductVariantDescription { get; set; }

		public decimal Price { get; set; }
		public decimal VatPercent { get; set; } = 0;

		public string Comments { get; set; }

		// Navigational properties
		public Order Order { get; set; }
		public Product Product { get; set; }


	}
}