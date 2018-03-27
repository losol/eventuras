using System.Threading.Tasks;

namespace losol.EventManagement.Services.Messaging.Sms
{
	public interface ISmsSender
	{
		/// <summary>
		/// Sends an SMS asynchronously.
		/// </summary>
		/// <param name="to">The E.164 formatted phone number to send the SMS to.</param>
		/// <param name="body">The SMS body text.</param>
		Task SendSmsAsync(string to, string body);
	}
}
