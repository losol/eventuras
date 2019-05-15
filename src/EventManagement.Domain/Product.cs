using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace losol.EventManagement.Domain
{
	public class Product
	{
		public int ProductId { get; set; }

		[Required]
		public string Name { get; set; }

		[StringLength(300, ErrorMessage = "Beskrivelsen kan bare være 300 tegn.")]
		[Display(Name = "Kort beskrivelse av kurset")]
		[DataType(DataType.MultilineText)]
		public string Description { get; set; }

		[Display(Name = "Mer informasjon")]
		[DataType(DataType.MultilineText)]
		public string MoreInformation { get; set; }

		public bool EnableQuantity { get; set; } = false;
		[Display(Name = "Må deltaker bestille et antall av produktet?")]
		public int MinimumQuantity { get; set; } = 0;

		public decimal Price { get; set; }
		public int VatPercent { get; set; } = 0;	

		public int Inventory { get; set; } = 0;
		public bool Published {get;set;} = true;

        // Order used to display the products
        // Products with lower values should be shown first.
        public int DisplayOrder { get; set; } = int.MaxValue;

        // Navigational properties
        // "Child" of an eventinfo.
        public int EventInfoId { get; set; }
		public EventInfo Eventinfo { get; set; }

		// Has a list of productvariants.
		public List<ProductVariant> ProductVariants { get; set; }

		public List<OrderLine> OrderLines { get; set; }

		public bool IsMandatory => MinimumQuantity > 0;
	}
}