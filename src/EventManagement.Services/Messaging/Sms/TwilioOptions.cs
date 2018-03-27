using System;
namespace losol.EventManagement.Services.Messaging.Sms
{
	public class TwilioOptions
	{
		public string From { get; set; }
		public string Sid { get; set; }
		public string AuthToken { get; set; }
	}
}
