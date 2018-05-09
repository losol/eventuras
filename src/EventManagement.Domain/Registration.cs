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

		public void CreateOrder(IEnumerable<OrderDTO> orders, IEnumerable<OrderLine> refundlines = null)
		{
			_ = orders ?? throw new ArgumentNullException(nameof(orders));

			// Check if the products belongs to the event
			if(orders != null && orders.Where(p => p.Product.EventInfoId != EventInfoId).Any())
			{
				throw new ArgumentException(
					message: "All the products must belong to the event being registered for.",
					paramName: nameof(orders)
				);
			}

			// Check if the variants belong to the product
			// FIXME: Don't trust the DTO, check with real data instead!
			if(!orders.Where(o => o.Variant != null).All(o => o.Variant.ProductId == o.Product.ProductId))
			{
				throw new ArgumentException(
					message: "Variant & Product IDs must match.",
					paramName: nameof(orders)
				);
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

			if (orders != null) {
				order.OrderLines = _createOrderLines(orders, refundlines);
			}
			if(refundlines != null)
			{
				order.OrderLines.AddRange(refundlines);
			}

			order.AddLog();
			this.Orders = this.Orders ?? new List<Order>();
			this.Orders.Add(order);
		}

		/// <summary>
		/// Updates an existing order if it's not already been invoiced.
		/// Else creates a new order.
		/// </summary>
		/// <param name="orders"></param>
		/// <param name="variants"></param>
		public void CreateOrUpdateOrder(ICollection<OrderDTO> orders)
		{
			// Get the existing productids
            var existingProducts = Orders.Where(o => o.Status != OrderStatus.Cancelled && o.Status != OrderStatus.Refunded)
                                        .SelectMany(o => o.OrderLines
                                        .Where(l => l.ProductId.HasValue)
                                    );
			var existingProductIds = existingProducts.Select(l => l.ProductId.Value);

            // Check if an order needs to be refunded
            var conflictingProductIds = existingProductIds.Intersect(orders.Select(p => p.Product.ProductId));
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
					if(!orders.Where(p => p.Product.ProductId == line.ProductId).Any())
					{
						orders.Add(new OrderDTO
						{
							Product = line.Product,
							Variant = line.ProductVariant,
							Quantity = line.Quantity
							// TODO: consider the order lines price
							// that could have been edited for the 
							// given orderline
						});
					}
				}
            }

			// Check if any uninvoiced orders exist (excluding the cancelled ofcourse)
			var editableOrders = Orders.Where(o => o.Status != OrderStatus.Invoiced && o.Status != OrderStatus.Cancelled && o.Status != OrderStatus.Refunded);

			if(!editableOrders.Any())
			{
				// Create a new order
				CreateOrder(orders, refundLines);
				return;
			}

			var orderToUpdate = editableOrders.First();
			orderToUpdate.OrderLines.AddRange(_createOrderLines(orders, refundLines));
		}

		private List<OrderLine> _createOrderLines(
			IEnumerable<OrderDTO> orders, 
			IEnumerable<OrderLine> refundlines = null)
		{
			refundlines = refundlines ?? new List<OrderLine>();
			var orderLines = orders.Select(p =>
				{
					return new OrderLine
					{
						ProductId = p.Product.ProductId,
						ProductVariantId = p.Variant?.ProductVariantId,
						Price = p.Variant?.Price ?? p.Product.Price,
						VatPercent = p.Variant?.VatPercent ?? p.Product.VatPercent,
						Quantity = Math.Max(p.Quantity, p.Product.MandatoryCount),

						ProductName = p.Product.Name,
						ProductDescription = p.Product.Description,

						ProductVariantName = p.Variant?.Name,
						ProductVariantDescription = p.Variant?.Description

						// Comments
					};
				});
			orderLines.Concat(refundlines);
			return orderLines.ToList();
		}
	}

	public class OrderDTO
    {
        public Product Product { get; set; }
        public ProductVariant Variant { get; set; }
        public int Quantity { get; set; } = 1; // FIXME: Should default to Product.MandatoryCount
    }
}
