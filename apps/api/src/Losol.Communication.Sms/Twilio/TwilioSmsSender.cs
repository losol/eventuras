using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Losol.Communication.HealthCheck.Abstractions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Twilio;
using Twilio.Exceptions;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace Losol.Communication.Sms.Twilio;

public class TwilioSmsSender : ISmsSender
{
    private readonly IOptions<TwilioOptions> _options;
    private readonly IHealthCheckStorage _healthCheckStorage;
    private readonly ILogger<TwilioSmsSender> _logger;

    public TwilioSmsSender(
        IOptions<TwilioOptions> options,
        IHealthCheckStorage healthCheckStorage,
        ILogger<TwilioSmsSender> logger)
    {
        _options = options ?? throw new ArgumentNullException(nameof(options));
        _healthCheckStorage = healthCheckStorage ?? throw new ArgumentNullException(nameof(healthCheckStorage));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));

        TwilioClient.Init(_options.Value.Sid, _options.Value.AuthToken);
    }

    public async Task SendSmsAsync(string to, string body, int orgId)
    {
        if (string.IsNullOrWhiteSpace(to))
        {
            throw new ArgumentException(nameof(to));
        }

        if (string.IsNullOrWhiteSpace(body))
        {
            throw new ArgumentException(nameof(body));
        }

        try
        {
            var messageResource = await MessageResource.CreateAsync(
                new PhoneNumber(to),
                from: new PhoneNumber(_options.Value.From),
                body: body
            );

            _logger.LogDebug("Sent message to {to}; message Sid: {sid}",
                to, messageResource.Sid);

            await _healthCheckStorage.CheckedAsync(ISmsSender.ServiceName,
                new HealthCheckStatus(HealthStatus.Healthy));
        }
        catch (ApiException e)
        {
            _logger.LogError(e, "Failed to send SMS to {to}, Twilio Error {code} - {info}", to, e.Code, e.MoreInfo);

            await _healthCheckStorage.CheckedAsync(ISmsSender.ServiceName,
                new HealthCheckStatus(HealthStatus.Unhealthy, e.Message));

            throw new SmsSenderException($"Failed to send SMS to {to}", e);
        }
    }

    public async Task<HealthCheckStatus> CheckHealthAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Making Twilio service health check");

        try
        {
            _logger.LogDebug("Getting 1 message from twilio");
            var resource = await MessageResource.ReadAsync(new ReadMessageOptions
            {
                Limit = 1
            });
            _logger.LogDebug("Successfully read {num} messages", resource.Count());

            _logger.LogInformation("Health check passed");
            return new HealthCheckStatus(HealthStatus.Healthy);
        }
        catch (ApiException e)
        {
            _logger.LogError(e, "Twilio service health check failed: {code} - {info}", e.Code, e.MoreInfo);
            return new HealthCheckStatus(HealthStatus.Unhealthy, e.MoreInfo);
        }
    }
}
