using System;
using System.Threading.RateLimiting;
using System.Threading.Tasks;
using Eventuras.Infrastructure;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.WebApi.Extensions;

public static class RateLimitingExtensions
{
    /// <summary>Policy for <c>[AllowAnonymous]</c> endpoints.</summary>
    public const string AnonymousPolicy = "anonymous";

    /// <summary>Default cap, lowered to half the DB pool when that is smaller.</summary>
    public const int DefaultPermitLimit = 10;
    public const int DefaultQueueLimit = 20;
    public const int RetryAfterSeconds = 5;

    /// <summary>
    ///     Caps concurrent unauthenticated requests per replica, so a flood cannot
    ///     use up the database pool. Authenticated requests are not limited.
    ///     Config: <c>RateLimiting:Anonymous:PermitLimit</c> and <c>:QueueLimit</c>.
    /// </summary>
    public static IServiceCollection AddAnonymousRateLimiting(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var section = configuration.GetSection("RateLimiting:Anonymous");
        var limiterOptions = new ConcurrencyLimiterOptions
        {
            PermitLimit = section.GetValue("PermitLimit", GetDefaultPermitLimit(configuration)),
            QueueLimit = section.GetValue("QueueLimit", DefaultQueueLimit),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
        };

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.OnRejected = (context, _) =>
            {
                context.HttpContext.Response.Headers.RetryAfter = RetryAfterSeconds.ToString();
                return ValueTask.CompletedTask;
            };
            options.AddPolicy(AnonymousPolicy, context =>
                context.User.Identity?.IsAuthenticated == true
                    ? RateLimitPartition.GetNoLimiter("authenticated")
                    : RateLimitPartition.GetConcurrencyLimiter("anonymous", _ => limiterOptions));
        });

        return services;
    }

    /// <summary>Half the DB pool (at least 1, at most <see cref="DefaultPermitLimit" />).</summary>
    public static int GetDefaultPermitLimit(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        var poolSize = string.IsNullOrWhiteSpace(connectionString)
            ? DatabaseConnectionPool.DefaultMaxPoolSize
            : DatabaseConnectionPool.GetMaxPoolSize(connectionString,
                configuration.GetValue<int?>(DatabaseConnectionPool.MaxPoolSizeConfigKey));

        return Math.Clamp(poolSize / 2, 1, DefaultPermitLimit);
    }
}
