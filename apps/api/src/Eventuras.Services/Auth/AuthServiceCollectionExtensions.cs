using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.Auth;

internal static class AuthServiceCollectionExtensions
{
    public static void AddAuthServices(this IServiceCollection services)
    {
        // Auth is handled entirely by the external IdP via JWT.
        // Organization-specific roles are enriched via DbUserClaimTransformation.
    }
}
