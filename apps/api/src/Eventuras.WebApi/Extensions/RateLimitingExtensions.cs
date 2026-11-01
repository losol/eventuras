using System.Threading.RateLimiting;
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

    public const int DefaultPermitLimit = 10;
    public const int DefaultQueueLimit = 20;

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
            PermitLimit = section.GetValue("PermitLimit", DefaultPermitLimit),
            QueueLimit = section.GetValue("QueueLimit", DefaultQueueLimit),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
        };

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.AddPolicy(AnonymousPolicy, context =>
                context.User.Identity?.IsAuthenticated == true
                    ? RateLimitPartition.GetNoLimiter("authenticated")
                    : RateLimitPartition.GetConcurrencyLimiter("anonymous", _ => limiterOptions));
        });

        return services;
    }
}
