using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Losol.Communication.Sms.Mock;

public class MockSmsSender : ISmsSender
{
    private readonly ILogger<MockSmsSender> _logger;

    public MockSmsSender(ILogger<MockSmsSender> logger) => _logger = logger;

    public Task SendSmsAsync(string to, string body, int orgId)
    {
        _logger.LogInformation("Sending SMS with text \"{body}\" to {to}", body, to);
        return Task.CompletedTask;
    }
}
