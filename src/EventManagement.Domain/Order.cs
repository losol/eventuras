using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace losol.EventManagement.Domain
{
	public class Order
	{
		public enum OrderStatus
		{
			Draft,
			Verified,
			Invoiced,
			Paid,
			Refunded
		}

		[Required]
		public int OrderId { get; set; }
		public string UserId { get; set; }
		public int RegistrationId { get; set; }
		public int EventInfoId { get; set; }
		public int OrderStatusId { get; set; }

		// From registration, should be Participant details, if Customer details
		// does not exist.
		public string CustomerName { get; set; }
		public string CustomerEmail { get; set; }
		public string CustomerVatNumber { get; set; }
		public string CustomerInvoiceReference { get; set; }
		public int? PaymentMethodId { get; set; }

		public DateTime OrderTime { get; set; }

		// Comments are from the user registered
		public string Comments { get; set; }

		// Log is information from the system. Ie registration time and user.
		public string Log { get; set; }

		// Navigational properties
		public Registration Registration { get; set; }
		public PaymentMethod PaymentMethod { get; set; }
		public EventInfo EventInfo { get; set; }
		public OrderStatus Status { get; set; } = OrderStatus.Draft;

		public List<OrderLine> OrderLines { get; set; }

	}
}