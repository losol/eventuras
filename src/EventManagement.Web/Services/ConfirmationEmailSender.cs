using System;
using System.Threading.Tasks;
using losol.EventManagement.Services;
using losol.EventManagement.Services.Messaging;
using losol.EventManagement.ViewModels;

namespace losol.EventManagement.Web.Services
{
	public sealed class ConfirmationEmailSender : ApplicationEmailSender
	{
		protected override string Template => "Templates/Email/EventRegistration";
		public ConfirmationEmailSender(IEmailSender emailSender, IRenderService renderService) 
			: base(emailSender, renderService)
		{ }

		public  Task SendConfirmationAsync(string emailAddress, string subject, EventRegistration vm) =>
			 SendAsync(emailAddress, subject, vm);

	}
}
