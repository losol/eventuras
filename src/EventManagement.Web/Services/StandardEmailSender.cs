using System;
using System.Threading.Tasks;
using losol.EventManagement.Services;
using losol.EventManagement.Services.Messaging;
using losol.EventManagement.ViewModels;

namespace losol.EventManagement.Web.Services
{
	public sealed class StandardEmailSender : ApplicationEmailSender
	{
		protected override string Template => "Templates/Email/StandardEmail";
		public StandardEmailSender(
			IEmailSender emailSender,
			IRenderService renderService
		) : base(emailSender, renderService)
		{ }

		public Task SendStandardEmailAsync(EmailMessage vm) =>
			SendAsync(vm.Email, vm.Subject, vm, vm.Attachment);

	}
}
