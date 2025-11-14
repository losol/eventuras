using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Losol.Communication.Email.Mock;

public class MockEmailSender : AbstractEmailSender
{
    private readonly ILogger<MockEmailSender> _logger;

    public MockEmailSender(ILogger<MockEmailSender> logger) => _logger = logger;

    protected override Task SendEmailInternalAsync(EmailModel emailModel)
    {
        _logger.LogInformation("Sending email from {from} with subject {subject} to {address}",
            emailModel.From, emailModel.Subject, emailModel.Recipients.First());
        return Task.CompletedTask;
    }
}
