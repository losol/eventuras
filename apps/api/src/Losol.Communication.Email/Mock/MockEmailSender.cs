using System.Linq;
using System.Threading.Tasks;
using Losol.Communication.HealthCheck.Abstractions;
using Microsoft.Extensions.Logging;

namespace Losol.Communication.Email.Mock;

public class MockEmailSender : AbstractEmailSender
{
    private readonly ILogger<MockEmailSender> _logger;

    public MockEmailSender(ILogger<MockEmailSender> logger, IHealthCheckStorage healthCheckStorage) :
        base(healthCheckStorage) => _logger = logger;

    protected override Task SendEmailInternalAsync(EmailModel emailModel)
    {
        _logger.LogInformation("Sending email from {from} with subject {subject} to {address}",
            emailModel.From, emailModel.Subject, emailModel.Recipients.First());
        return Task.CompletedTask;
    }
}
