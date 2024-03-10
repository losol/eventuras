using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Losol.Communication.HealthCheck.Abstractions;
using Microsoft.Extensions.Logging.Abstractions;

namespace Losol.Communication.Email
{
    public abstract class AbstractEmailSender : IEmailSender
    {
        private readonly IHealthCheckStorage _healthCheckStorage;

        protected AbstractEmailSender(IHealthCheckStorage healthCheckStorage)
        {
            _healthCheckStorage = healthCheckStorage ?? throw new ArgumentNullException(nameof(healthCheckStorage));
        }

        public Task SendEmailAsync(
            string address,
            string subject,
            string message,
            Attachment attachment = null,
            EmailMessageType messageType = EmailMessageType.Html)
        {
            if (string.IsNullOrEmpty(address))
            {
                throw new ArgumentException(nameof(address));
            }
            if (string.IsNullOrEmpty(subject))
            {
                throw new ArgumentException(nameof(subject));
            }
            if (string.IsNullOrEmpty(message))
            {
                throw new ArgumentException(nameof(message));
            }
            return SendEmailAsync(new EmailModel
            {
                Recipients = new[] { new Address(address) },
                Subject = subject,
                TextBody = messageType == EmailMessageType.Text ? message : null,
                HtmlBody = messageType == EmailMessageType.Html ? message : null,
                Attachments = attachment != null
                    ? new List<Attachment> { attachment }
                    : new List<Attachment>()
            });
        }

        public async Task SendEmailAsync(EmailModel emailModel, EmailOptions options = null)
        {
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

        /// <exception cref="EmailSenderException">Failed to send email</exception>
        protected abstract Task SendEmailInternalAsync(EmailModel emailModel);

        public virtual Task<HealthCheckStatus> CheckHealthAsync(int orgId, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(new HealthCheckStatus(HealthStatus.Healthy)); // Stub
        }
    }
}
