using Losol.Communication.Email;
using Losol.Communication.HealthCheck.Abstractions;
using Microsoft.Extensions.Options;
using System;

namespace Losol.Communication.HealthCheck.Email
{
    public class EmailHealthCheck : AbstractPeriodicHealthCheck
    {
        private readonly IOptions<EmailHealthCheckSettings> _options;

        protected override string ServiceName => IEmailSender.ServiceName;
        protected override TimeSpan CheckPeriod => _options.Value.CheckPeriod;

        public EmailHealthCheck(
            IOptions<EmailHealthCheckSettings> options,
            IHealthCheckStorage healthCheckStorage,
            IEmailSender emailSender) : base(healthCheckStorage, emailSender)
        {
            _options = options ?? throw new ArgumentNullException(nameof(options));
        }
    }
}
