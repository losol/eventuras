using System;
using System.Threading;
using System.Threading.Tasks;
using Losol.Communication.HealthCheck.Abstractions;

namespace Losol.Communication.Email;

public abstract class AbstractEmailSender : IEmailSender
{
    private readonly IHealthCheckStorage _healthCheckStorage;

    protected AbstractEmailSender(IHealthCheckStorage healthCheckStorage) => _healthCheckStorage =
        healthCheckStorage ?? throw new ArgumentNullException(nameof(healthCheckStorage));

    public async Task SendEmailAsync(EmailModel emailModel, EmailOptions options = null)
    {
        emailModel.Validate();

        try
        {
            await SendEmailInternalAsync(emailModel);
            await _healthCheckStorage.CheckedAsync(IEmailSender.ServiceName,
                new HealthCheckStatus(HealthStatus.Healthy));
        }
        catch (EmailSenderException e)
        {
            await _healthCheckStorage.CheckedAsync(IEmailSender.ServiceName,
                new HealthCheckStatus(HealthStatus.Unhealthy, e.Message));
            throw;
        }
        catch (Exception e)
        {
            await _healthCheckStorage.CheckedAsync(IEmailSender.ServiceName,
                new HealthCheckStatus(HealthStatus.Unhealthy, e.Message));
            throw new EmailSenderException(e.Message, e);
        }
    }

    public virtual Task<HealthCheckStatus> CheckHealthAsync(CancellationToken cancellationToken = default) =>
        Task.FromResult(new HealthCheckStatus(HealthStatus.Healthy)); // Stub

    /// <exception cref="EmailSenderException">Failed to send email</exception>
    protected abstract Task SendEmailInternalAsync(EmailModel emailModel);
}
