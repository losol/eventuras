using System;
namespace losol.EventManagement
{
	internal class AppSettings
	{
		public EmailProvider EmailProvider { get; set; }
	}

	internal enum EmailProvider 
	{
		SendGrid,
		File,
		Mock
	}
}
