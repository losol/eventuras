using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace losol.EventManagement.Domain
{
	public class PaymentMethod
	{
		public enum PaymentProvider
		{
			EmailInvoice,
			Stripe,
			PowerOfficeEmailInvoice,
			PowerOfficeEHFInvoice,
			Vipps
		}

		public int PaymentMethodId { get; set; }

		public string Code { get; set; }

		[Required]
		[StringLength(75)]
		[Display(Name = "Navn på betalingsmetode")]
		public string Name { get; set; }
		public PaymentProvider Provider { get; set; }

		public bool Active { get; set; } = false;
		public bool AdminOnly { get; set; } = false;
		public bool IsDefault { get; set; } = false;
	}
}
