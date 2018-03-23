using System.Threading.Tasks;

namespace losol.EventManagement.Services.Messaging
{
	public class MockEmailSender : IEmailSender
	{
		public async Task SendEmailAsync(string email, string subject, string message)
		{
			await Task.FromResult(0);
		}
	}
}
