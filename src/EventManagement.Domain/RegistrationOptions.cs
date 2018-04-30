using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace losol.EventManagement.Domain
{


	public class RegistrationOption
	{
		[ForeignKey("Registration")]
		public int RegistrationId { get; set; }

        public int Quantity { get; set; } = 1;
		public int? ProductId { get; set; }
		public int? ProductVariantId { get; set; }
		
		public string ProductName { get; set; }
		public string ProductDescription { get; set; }

		public string ProductVariantName { get; set; }
		public string ProductVariantDescription { get; set; }

		public decimal Price { get; set; }
		public decimal VatPercent { get; set; } = 0;

		public string Comments { get; set; }

	}
}
