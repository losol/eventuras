using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using static losol.EventManagement.Domain.PaymentMethod;

namespace losol.EventManagement.Domain
{
	public class Order
	{
		public enum OrderStatus
		{
			Draft,
			Verified,
			Invoiced,
			Cancelled,
			Refunded
		}


		[Required]
		public int OrderId { get; set; }
		public string UserId { get; set; }
		public int RegistrationId { get; set; }
		public string ExternalInvoiceId {get;set;}
		public bool Paid { get;set; } = false;

		/**
			Allowed transitions:
			Draft
			Draft -> Cancelled
			Draft -> Verified -> Cancelled
			Draft -> Verified -> Invoiced
			Draft -> Verified -> Invoiced -> Cancelled
		 */
		private OrderStatus _status = OrderStatus.Draft;
		public OrderStatus Status {
			get => _status;
			set {
				switch(value) {
					case OrderStatus.Draft:
						throw new InvalidOperationException("Orders cannot be set as draft.");
					case OrderStatus.Verified:
						if(_status != OrderStatus.Draft)
						{
							throw new InvalidOperationException("Only draft orders can be verified.");
						}
						break;
					case OrderStatus.Invoiced:
						if(_status != OrderStatus.Verified)
						{
							throw new InvalidOperationException("Only verified orders can be invoiced.");
						}
						break;

					case OrderStatus.Refunded:
						if(_status != OrderStatus.Invoiced)
						{
							throw new InvalidOperationException("Only invoiced orders can be refunded.");
						}
						break;

					case OrderStatus.Cancelled:
						break;

				}
				_status = value;
			}
		}

		// From registration, should be Participant details, if Customer details
		// does not exist.
		// TODO: REMOVE, USE FROM REGISTRATION...
		public string CustomerName { get; set; }
		public string CustomerEmail { get; set; }
		public string CustomerVatNumber { get; set; }
		public string CustomerInvoiceReference { get; set; }
		public int? PaymentMethodId { get; set; }
        public PaymentProvider? PaymentMethod { get; set; }

		public DateTime OrderTime { get; set; } = DateTime.UtcNow;

		// Comments are from the user registered
		public string Comments { get; set; }

		// Log is information from the system. Ie registration time and user.
		public string Log { get; set; }

		// Navigational properties
		public Registration Registration { get; set; }
		public ApplicationUser User { get; set; }
		public List<OrderLine> OrderLines { get; set; }


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

		public bool CanEdit =>
			Status == OrderStatus.Draft || Status == OrderStatus.Verified;

		// TODO: Write tests for this
		public decimal TotalAmount =>
			OrderLines.Sum(l => l.LineTotal);

		public void MarkAsVerified()
		{
			Status = OrderStatus.Verified;
			this.AddLog();
		}

		public void MarkAsCancelled()
		{
			Status = OrderStatus.Cancelled;
			this.AddLog();
		}

		public void MarkAsInvoiced()
		{
			Status = OrderStatus.Invoiced;
			this.AddLog();
		}

		public void MarkAsRefunded()
		{
			Status = OrderStatus.Refunded;
			this.AddLog();
		}

        public Order CreateRefundOrder()
        {
            if(Status != OrderStatus.Invoiced)
            {
                throw new InvalidOperationException("Only invoiced orders can be refunded.");
            }
            var refund = new Order
            {
                CustomerEmail = CustomerEmail,
                CustomerName = CustomerName,
                CustomerVatNumber = CustomerVatNumber,
                RegistrationId = RegistrationId,
                UserId = UserId,
                // TODO: Add other fields like payment method, etc.
                OrderLines = new List<OrderLine>()
            };
            foreach(var line in OrderLines)
            {
                refund.OrderLines.Add(line.CreateRefundOrderLine());
            }
            return refund;
        }

	}
}
