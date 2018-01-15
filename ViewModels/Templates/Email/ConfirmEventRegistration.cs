using System;

namespace losol.EventManagement.ViewModels
{
	public class ConfirmEventRegistration
	{
		public string VerificationUrl { get; set; }
		public string Name { get; set; }
		public string Email { get; set; }
		public string Phone { get; set; }
		public string PaymentMethod { get; set; }
		public string EventTitle { get; set; }
		public string EventDescription { get; set; }
		public string EventDate { get; set; }
		public string EventUrl { get; set; }

	}
}