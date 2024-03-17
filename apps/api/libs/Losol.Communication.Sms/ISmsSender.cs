using System.Threading.Tasks;
using Losol.Communication.HealthCheck.Abstractions;

namespace Losol.Communication.Sms;

public interface ISmsSender : IHealthCheckService
{
    const string ServiceName = "sms";

    /// <summary>
    /// Sends an SMS asynchronously.
    /// </summary>
    /// <param name="to">The E.164 formatted phone number to send the SMS to.</param>
    /// <param name="body">The SMS body text.</param>
    /// <exception cref="SmsSenderException">Failed to send SMS</exception>
    Task SendSmsAsync(string to, string body, int orgId);
}
