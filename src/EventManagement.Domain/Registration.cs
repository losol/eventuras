using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace losol.EventManagement.Domain
{

	public class Registration
	{
		public int RegistrationId { get; set; }
		public int EventInfoId { get; set; }
		public string UserId { get; set; }


		[Display(Name = "Møtt?")]
		public bool Attended { get; set; } = false;

		[Display(Name = "Skal ha kursdiplom?")]
		public bool Diploma { get; set; } = true;

		// The participant
		public string ParticipantName { get; set; }
		public string ParticipantJobTitle { get; set; }
		public string ParticipantEmployer { get; set; }
		public string ParticipantCity { get; set; }

		// Who pays for it?
		public string CustomerName { get; set; }
		public string CustomerEmail { get; set; }
		public string CustomerVatNumber { get; set; }
		public string CustomerInvoiceReference { get; set; }

		[Display(Name = "Kommentar")]
		[DataType(DataType.MultilineText)]
		public string Notes { get; set; }

		[Display(Name = "Logg")]
		[DataType(DataType.MultilineText)]
		public string Log { get; set; }

		public DateTime? RegistrationTime { get; set; }
		public string RegistrationBy { get; set; }

		[Display(Name = "Gratisdeltaker?")]
		public bool FreeRegistration { get; set; } = false;

		[Display(Name = "Betalingsmetode")]
		public int? PaymentMethodId { get; set; }

		[Display(Name = "Verifisert påmelding?")]
		public bool Verified { get; set; } = false;

		[Display(Name = "Verifiseringskode")]
		public string VerificationCode { get; set; }

		// Navigation properties
		public EventInfo EventInfo { get; set; }
		public ApplicationUser User { get; set; }
		public PaymentMethod PaymentMethod { get; set; }
		public Order Order { get; set; }


		public void Verify()
		{
			Verified = true;
		}

		public bool HasOrder => Order == null;

		public void CreateOrder(IEnumerable<Product> products, IEnumerable<ProductVariant> variants)
		{
			_ = products ?? throw new ArgumentNullException(nameof(products));
			if(Order != null)
			{
				throw new InvalidOperationException("This registration already has an order.");
			}


			if(products.Where(p => p.EventInfoId != EventInfoId).Any())
			{
				throw new ArgumentException(
					message: "All the products must belong to the event being registered for.", 
					paramName: nameof(products)
				);
			}
			if(variants != null)
			{
				if (variants.Where(v => !products.Select(p => p.ProductId).Contains(v.ProductId)).Any())
				{
					throw new ArgumentException(
						message: "All the product-variants must belong to ",
						paramName: nameof(products)
					);
				}	
			}

			var orderLines = products.Select(p =>
			{
				var v = variants?.Where(var => var.ProductId == p.ProductId).SingleOrDefault();
				return new OrderLine
				{
					ProductId = p.ProductId,
					ProductVariantId = v?.ProductVariantId,
					Price = v?.Price ?? p.Price,
					VatPercent = v?.VatPercent ?? p.VatPercent,

					ProductName = p.Name,
					ProductDescription = p.Description,

					ProductVariantName = v?.Name,
					ProductVariantDescription = v?.Description,

					// Comments
					// Quantity
				};
			}).ToList();

			var order = new Order
			{
				CustomerName = CustomerName ?? ParticipantName,

				CustomerEmail = CustomerEmail,
				CustomerVatNumber = CustomerVatNumber,
				CustomerInvoiceReference = CustomerInvoiceReference,

				PaymentMethodId = PaymentMethodId,
				RegistrationId = RegistrationId,

				OrderLines = orderLines
			};
			order.AddLog();
			this.Order = order;
		}
		public void CreateOrder(IEnumerable<Product> products) => CreateOrder(products, null);

		public void CreateRefund()
		{
			throw new NotImplementedException();
		}
	}
}
