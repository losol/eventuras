using System;
using System.Threading.Tasks;

namespace losol.EventManagement.Services.Messaging.Sms
{
	public class MockSmsSender : ISmsSender
	{
		public async Task SendSmsAsync(string to, string body)
		{
			await Task.FromResult(0);
		}
	}
}
