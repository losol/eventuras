using System;
namespace losol.EventManagement
{
	internal class AppSettings
	{
		public EmailProvider EmailProvider { get; set; }
		public SmsProvider SmsProvider { get; set; }
	}

	internal enum EmailProvider 
	{
		SendGrid,
		File,
		Mock
	}

	internal enum SmsProvider
	{
		Twilio,
		Mock
	}
}
