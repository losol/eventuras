using System;
using losol.EventManagement.Services.Messaging;

namespace losol.EventManagement.ViewModels
{
	public class EmailMessage
	{
		public string Name { get; set; }
		public string Email { get; set; }
		public string Subject { get; set; }
		public string Message { get; set; }
		public Attachment Attachment { get; set; }
	}
}
