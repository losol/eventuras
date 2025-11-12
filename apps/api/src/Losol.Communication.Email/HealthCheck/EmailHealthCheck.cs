using System;
using Losol.Communication.HealthCheck.Abstractions;
using Losol.Communication.HealthCheck.Email;
using Microsoft.Extensions.Options;

namespace Losol.Communication.Email.HealthCheck;

public class EmailHealthCheck : AbstractPeriodicHealthCheck
{
    private readonly IOptions<EmailHealthCheckSettings> _options;

    public EmailHealthCheck(
        IOptions<EmailHealthCheckSettings> options,
        IHealthCheckStorage healthCheckStorage,
        IEmailSender emailSender) : base(healthCheckStorage, emailSender) =>
        _options = options ?? throw new ArgumentNullException(nameof(options));

    protected override string ServiceName => IEmailSender.ServiceName;
    protected override TimeSpan CheckPeriod => _options.Value.CheckPeriod;
}
