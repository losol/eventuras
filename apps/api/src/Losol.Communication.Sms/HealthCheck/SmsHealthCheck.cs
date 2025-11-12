using System;
using Losol.Communication.HealthCheck.Abstractions;
using Losol.Communication.HealthCheck.Sms;
using Microsoft.Extensions.Options;

namespace Losol.Communication.Sms.HealthCheck;

public class SmsHealthCheck : AbstractPeriodicHealthCheck
{
    private readonly IOptions<SmsHealthCheckSettings> _options;

    public SmsHealthCheck(
        IOptions<SmsHealthCheckSettings> options,
        IHealthCheckStorage healthCheckStorage,
        ISmsSender smsSender) : base(healthCheckStorage, smsSender) =>
        _options = options ?? throw new ArgumentNullException(nameof(options));

    protected override string ServiceName => ISmsSender.ServiceName;
    protected override TimeSpan CheckPeriod => _options.Value.CheckPeriod;
}
