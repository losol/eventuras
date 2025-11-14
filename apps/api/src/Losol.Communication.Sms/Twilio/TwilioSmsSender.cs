using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Twilio;
using Twilio.Exceptions;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace Losol.Communication.Sms.Twilio;

public class TwilioSmsSender : ISmsSender
{
    private readonly ILogger<TwilioSmsSender> _logger;
    private readonly IOptions<TwilioOptions> _options;

    public TwilioSmsSender(
        IOptions<TwilioOptions> options,
        ILogger<TwilioSmsSender> logger)
    {
        _options = options ?? throw new ArgumentNullException(nameof(options));
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
        }
        catch (ApiException e)
        {
            _logger.LogError(e, "Failed to send SMS to {to}, Twilio Error {code} - {info}", to, e.Code, e.MoreInfo);
            throw new SmsSenderException($"Failed to send SMS to {to}", e);
        }
    }
}
