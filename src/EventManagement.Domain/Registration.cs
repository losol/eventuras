using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using static losol.EventManagement.Domain.Order;

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

/*
		public int? CertificateId { get;set; }
		public Certificate Certificate { get;set; }
 */
		// Navigation properties
		public EventInfo EventInfo { get; set; }
		public ApplicationUser User { get; set; }
		public PaymentMethod PaymentMethod { get; set; }
		public List<Order> Orders { get; set; }


		public void Verify()
		{
			Verified = true;
		}
		public void RegisterAttendance() 
		{
			Attended = true;
		}

		public void RemoveAttendance() 
		{
			Attended = false;
		}

		public bool HasOrder => Orders != null && Orders.Count > 0;
		//public bool HasCertificate => Certificate != null;

		public void CreateOrder(IEnumerable<Product> products, IEnumerable<ProductVariant> variants)
		{
			_ = products ?? throw new ArgumentNullException(nameof(products));

			// Check if products belnongs to the event	
			if(products != null && products.Where(p => p.EventInfoId != EventInfoId).Any())
			{
				throw new ArgumentException(
					message: "All the products must belong to the event being registered for.", 
					paramName: nameof(products)
				);
			}

			// Check that variants have products
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

			// Create order.
			var order = new Order
			{
				UserId = UserId,

				CustomerName = CustomerName ?? ParticipantName,
				CustomerEmail = CustomerEmail ?? CustomerEmail,
				CustomerVatNumber = CustomerVatNumber,
				CustomerInvoiceReference = CustomerInvoiceReference,

				PaymentMethodId = PaymentMethodId,
				RegistrationId = RegistrationId
			};

			if (products != null) {
				order.OrderLines = _createOrderLines(products, variants);
			}
	
			order.AddLog();
			this.Orders = this.Orders ?? new List<Order>();
			this.Orders.Add(order);
		}
		public void CreateOrder(IEnumerable<Product> products) => CreateOrder(products, null);

		public void CreateOrder() => CreateOrder(null, null);

		/// <summary>
		/// Updates an existing order if it's not already been invoiced.
		/// Else creates a new order.
		/// </summary>
		/// <param name="products"></param>
		/// <param name="variants"></param>
		public void CreateOrUpdateOrder(IEnumerable<Product> products, IEnumerable<ProductVariant> variants)
		{
			// Check if the product already exists in one of this registration's orders
			var existingProductIds = Orders.Where(o => o.Status != OrderStatus.Cancelled)
											.SelectMany(o => o.OrderLines
											.Where(l => l.ProductId.HasValue)
											.Select(l => l.ProductId.Value)
										);
			if(existingProductIds.Intersect(products.Select(p => p.ProductId)).Any())
			{
				throw new InvalidOperationException("The same product cannot be added twice");
			}

			// Check if any uninvoiced orders exist (excluding the cancelled ofcourse)
			var uninvoicedOrders = Orders.Where(o => o.Status != OrderStatus.Invoiced && o.Status != OrderStatus.Cancelled);

			if(!uninvoicedOrders.Any())
			{
				// No uninvoiced orders exist
				// Create a new order
				CreateOrder(products, variants);
				return;
			}
			
			var orderToUpdate = uninvoicedOrders.First();
			orderToUpdate.OrderLines.AddRange(_createOrderLines(products, variants));
		}
		public void CreateOrUpdateOrder(IEnumerable<Product> products) =>
			CreateOrUpdateOrder(products, null);

		public void CreateRefund()
		{
			throw new NotImplementedException();
		}

		private List<OrderLine> _createOrderLines(IEnumerable<Product> products, IEnumerable<ProductVariant> variants)
		{
			var orderLines = products.Select(p =>
				{
					var v = variants?.Where(var => var.ProductId == p.ProductId).SingleOrDefault();
					return new OrderLine
					{
						ProductId = p.ProductId,
						ProductVariantId = v?.ProductVariantId,
						Price = v?.Price ?? p.Price,
						VatPercent = v?.VatPercent ?? p.VatPercent,
						Quantity = Math.Max(1, p.MandatoryCount), 

						ProductName = p.Name,
						ProductDescription = p.Description,

						ProductVariantName = v?.Name,
						ProductVariantDescription = v?.Description

						// Comments
					};
				});
			return orderLines.ToList();
		}
	}
}
