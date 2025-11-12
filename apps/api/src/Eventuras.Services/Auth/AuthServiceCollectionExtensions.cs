using Eventuras.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.Auth;

internal static class AuthServiceCollectionExtensions
{
    public static void AddAuthServices(this IServiceCollection services) => services
        .AddScoped<IUserClaimsPrincipalFactory<ApplicationUser>, ApplicationClaimsIdentityFactory>();
}
