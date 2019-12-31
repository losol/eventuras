using Losol.Communication.Email;
using System.Threading.Tasks;

namespace losol.EventManagement.Web.Services
{
    public abstract class ApplicationEmailSender
	{
		protected abstract string Template { get; }

		private readonly IEmailSender _emailSender;
		private readonly IRenderService _renderService;

		public ApplicationEmailSender(
			IEmailSender emailSender,
			IRenderService renderService
		)
		{
			_emailSender = emailSender;
			_renderService = renderService;
		}

		protected async Task SendAsync(string emailAddress, string subject, object vm, Attachment attachment)
		{
			var email = await _renderService.RenderViewToStringAsync(Template, vm);
			await _emailSender.SendEmailAsync(emailAddress, subject, email, attachment);
		}

		protected async Task SendAsync(string emailAddress, string subject, object vm)
		{
			var email = await _renderService.RenderViewToStringAsync(Template, vm);
			await _emailSender.SendEmailAsync(emailAddress, subject, email);
		}
	}
}
