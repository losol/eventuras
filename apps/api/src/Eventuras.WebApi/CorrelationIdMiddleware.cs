using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Eventuras.Services.Constants;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Sentry;

namespace Eventuras.WebApi;

public partial class CorrelationIdMiddleware
{
    private const int MaxCorrelationIdLength = 128;
    private readonly ILogger<CorrelationIdMiddleware> _logger;
    private readonly RequestDelegate _next;

    public CorrelationIdMiddleware(RequestDelegate next, ILogger<CorrelationIdMiddleware> logger)
    {
        _next = next ?? throw new ArgumentNullException(nameof(next));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = context.TraceIdentifier;

        if (context.Request.Headers.TryGetValue(Api.CorrelationIdHeader, out var requested)
            && !string.IsNullOrWhiteSpace(requested))
        {
            var value = requested.ToString();
            if (value.Length <= MaxCorrelationIdLength && SafeCorrelationId().IsMatch(value))
            {
                correlationId = value;
            }
        }

        context.TraceIdentifier = correlationId;
        context.Response.Headers[Api.CorrelationIdHeader] = correlationId;

        // Tag the Sentry/GlitchTip scope so captured events carry the same id
        // the client sees in the response header and the logs.
        SentrySdk.ConfigureScope(scope => scope.SetTag("correlation_id", correlationId));

        using (_logger.BeginScope(new Dictionary<string, object>
        {
            ["CorrelationId"] = correlationId
        }))
        {
            await _next(context);
        }
    }

    [GeneratedRegex(@"^[\w\-.:]+$")]
    private static partial Regex SafeCorrelationId();
}
