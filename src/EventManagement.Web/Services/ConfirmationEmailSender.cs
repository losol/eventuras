using System;
using System.Threading.Tasks;
using losol.EventManagement.Services;
using losol.EventManagement.Services.Messaging;
using losol.EventManagement.ViewModels;

namespace losol.EventManagement.Web.Services
{
	public sealed class ConfirmationEmailSender : ApplicationEmailSender
	{
		protected override string Template => "Templates/Email/ConfirmEventRegistration";
		public ConfirmationEmailSender(IEmailSender emailSender, IRenderService renderService) 
			: base(emailSender, renderService)
		{ }

		public async Task SendAsync(string emailAddress, string subject, ConfirmEventRegistration vm)
		{
			await base.SendAsync(emailAddress, subject, vm);
		}
	}
}
