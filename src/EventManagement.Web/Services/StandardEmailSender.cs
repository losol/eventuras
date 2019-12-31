using losol.EventManagement.ViewModels;
using Losol.Communication.Email;
using System.Threading.Tasks;

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
