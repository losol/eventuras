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
		public enum RegistrationStatus
		{
			Draft = 0,
			Cancelled = 1,
			Verified = 2,
			NotAttended = 3,
			Attended = 4,
			Finished = 5,

		}

		public enum RegistrationType
		{
			Participant = 0,
			Student = 1,
			Staff = 2,
			Lecturer = 3,
			Artist = 4
		}

		public int RegistrationId { get; set; }
		public int EventInfoId { get; set; }
		public string UserId { get; set; }

		public RegistrationStatus Status { get; set; } = RegistrationStatus.Draft;
		public RegistrationType Type { get; set; } = RegistrationType.Participant;

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

		public int? CertificateId {get;set;}
		public Certificate Certificate {get;set;}

		// Navigation properties
		public EventInfo EventInfo { get; set; }
		public ApplicationUser User { get; set; }
		public PaymentMethod PaymentMethod { get; set; }
		public List<Order> Orders { get; set; }

		public void Verify()
		{
			Status = RegistrationStatus.Verified;
			AddLog();
		}
		public void MarkAsAttended()
		{
			Status = RegistrationStatus.Attended;
			AddLog();
		}

		public void MarkAsNotAttended()
		{
			Status = RegistrationStatus.NotAttended;
			AddLog();
		}

		public bool HasOrder => Orders != null && Orders.Count > 0;
		public bool HasCertificate => CertificateId != null;

		public void AddLog(string text = null)
		{
			var logText = $"{DateTime.UtcNow.ToString("u")}: ";
			if(!string.IsNullOrWhiteSpace(text))
			{
				logText += $"{text}";
			} else {
				logText += $"{Status}";
			}
			Log += logText + "\n";
		}

		public void CreateOrder(IEnumerable<Product> products, IEnumerable<ProductVariant> variants, IEnumerable<OrderLine> refundlines)
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
				order.OrderLines = _createOrderLines(products, variants, refundlines);
			}
			if(refundlines != null)
			{
				order.OrderLines.AddRange(refundlines);
			}

			order.AddLog();
			this.Orders = this.Orders ?? new List<Order>();
			this.Orders.Add(order);
		}
		public void CreateOrder(ICollection<Product> products, ICollection<ProductVariant> variants) => CreateOrder(products, variants, null);
		public void CreateOrder(ICollection<Product> products) => CreateOrder(products, null, null);

		public void CreateOrder() => CreateOrder(null, null, null);

		/// <summary>
		/// Updates an existing order if it's not already been invoiced.
		/// Else creates a new order.
		/// </summary>
		/// <param name="products"></param>
		/// <param name="variants"></param>
		public void CreateOrUpdateOrder(ICollection<Product> products, ICollection<ProductVariant> variants)
		{
			// Get the existing productids
            var existingProducts = Orders.Where(o => o.Status != OrderStatus.Cancelled && o.Status != OrderStatus.Refunded)
                                        .SelectMany(o => o.OrderLines
                                        .Where(l => l.ProductId.HasValue)
                                    );
			var existingProductIds = existingProducts.Select(l => l.ProductId.Value);

            // Check if an order needs to be refunded
            var conflictingProductIds = existingProductIds.Intersect(products.Select(p => p.ProductId));
            var conflictingProducts = existingProducts
				.Where(p => conflictingProductIds.Contains(p.ProductId.Value));

			// If a refund is required
			var refundLines = new List<OrderLine>();
            if(conflictingProductIds.Any())
            {
				var ordersToRefund = Orders
								.Where(o => o.OrderLines.Where(l => conflictingProductIds.Contains(l.ProductId.Value)).Any())
								.GroupBy(o => o.OrderId)
								.Select(g => g.First());
				
				// Refund the orders, and create refundlines for each of them
				foreach(var o in ordersToRefund)
				{
					o.MarkAsRefunded();
					refundLines.Add(OrderLine.CreateRefundOrderLine(o));
				}

				// Update the produces, variants arguments
				var refundedOrdersLines = ordersToRefund.SelectMany(l => l.OrderLines);
				foreach(var line in refundedOrdersLines)
				{
					if(!products.Where(p => p.ProductId == line.ProductId).Any())
					{
						products.Add(line.Product);
						if(line.ProductVariantId != null)
						{
							variants.Add(line.ProductVariant);
						}
					}
				}
            }

			// Check if any uninvoiced orders exist (excluding the cancelled ofcourse)
			var editableOrders = Orders.Where(o => o.Status != OrderStatus.Invoiced && o.Status != OrderStatus.Cancelled && o.Status != OrderStatus.Refunded);

			if(!editableOrders.Any())
			{
				// No uninvoiced orders exist
				// Create a new order
				CreateOrder(products, variants, refundLines);
				return;
			}

			var orderToUpdate = editableOrders.First();
			orderToUpdate.OrderLines.AddRange(_createOrderLines(products, variants, refundLines));
		}
		public void CreateOrUpdateOrder(ICollection<Product> products) =>
			CreateOrUpdateOrder(products, null);

		private List<OrderLine> _createOrderLines(
			IEnumerable<Product> products, 
			IEnumerable<ProductVariant> variants,
			IEnumerable<OrderLine> refundlines)
		{
			refundlines = refundlines ?? new List<OrderLine>();
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
			orderLines.Concat(refundlines);
			return orderLines.ToList();
		}
	}
}
