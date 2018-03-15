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
	}
}
