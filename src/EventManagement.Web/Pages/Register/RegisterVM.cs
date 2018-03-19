using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Web.Pages.Register
{
	public class RegisterVM
	{
		public int EventInfoId { get; set; }
		public string UserId { get; set; }

		[Required]
		[StringLength(100)]
		[Display(Name = "Navn")]
		public string ParticipantName { get; set; }

		[Required]
		[EmailAddress]
		[Display(Name = "E-post")]
		public string Email { get; set; }

		[Required]
		[Display(Name = "Mobiltelefon")]
		public string Phone { get; set; }

		[Display(Name = "Arbeidsplass")]
		public string ParticipantEmployer { get; set; }

		[Display(Name = "Stilling")]
		public string ParticipantJobTitle { get; set; }

		[Display(Name = "Sted/by")]
		public string ParticipantCity { get; set; }

		[Display(Name = "Kommentar til påmelding. ")]
		public string Notes { get; set; }

		[Display(Name = "Organisasjonsnummer (må fylles ut for EHF-faktura)")]
		public string CustomerVatNumber { get; set; }

		// Who pays for it?
		[Display(Name = "Fakturamottakers firmanavn")]
		public string CustomerName { get; set; }

		[Display(Name = "Fakturamottakers epost")]
		public string CustomerEmail { get; set; }

		[Display(Name = "Fakturareferanse")]
		public string CustomerInvoiceReference { get; set; }

		[Display(Name = "Betaling")]
		public int? PaymentMethodId { get; set; }

		public ProductVM[] Products { get; set; }

		public RegisterVM() { }
		public RegisterVM(EventInfo eventinfo, int? defaultPaymentMethod = null)
		{
			EventInfoId = eventinfo.EventInfoId;
			PaymentMethodId = defaultPaymentMethod;

			Products = new ProductVM[eventinfo.Products.Count];
			for (int i = 0; i < Products.Length; i++)
			{
				var currentProduct = eventinfo.Products[i];
				Products[i] = new ProductVM
				{
					Value = currentProduct.ProductId,
					IsMandatory = currentProduct.MandatoryCount > 0,
					IsSelected = currentProduct.MandatoryCount > 0,
					SelectedVariantId = currentProduct
						.ProductVariants
						.Select(pv => pv.ProductVariantId as int?)
						.FirstOrDefault()
				};
			}
		}

		public bool HasProducts => Products != null && Products.Length > 0;
		public List<int> SelectedProducts => 
			Products.Where(rp => rp.IsSelected)
					.Select(p => p.Value)
					.ToList();
	}
}
