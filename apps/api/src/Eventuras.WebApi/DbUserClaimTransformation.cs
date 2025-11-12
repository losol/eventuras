#nullable enable

using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Auth;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Users;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;

namespace Eventuras.WebApi;

/// <summary>
///     Transforms incoming claims to include claims from ApplicationUser in Eventuras.
/// </summary>
public class DbUserClaimTransformation : IClaimsTransformation
{
    private readonly IMemoryCache _cache;
    private readonly IUserClaimsPrincipalFactory<ApplicationUser> _claimsFactory;
    private readonly IUserRetrievalService _userRetrievalService;

    public DbUserClaimTransformation(
        IUserRetrievalService userRetrievalService,
        IMemoryCache cache,
        IUserClaimsPrincipalFactory<ApplicationUser> claimsFactory)
    {
        _userRetrievalService = userRetrievalService;
        _cache = cache;
        _claimsFactory = claimsFactory;
    }

    /// <summary>Adds claims from ApplicationUser to the principal if possible.</summary>
    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        var userEmail = principal.GetEmail();
        if (userEmail == null)
        {
            return principal;
        }

        var fromDb = await GetCachedUserClaims(userEmail);
        if (fromDb == null)
        {
            return principal;
        }

        principal.AddIdentities(fromDb.Identities);
        return principal;
    }

    private async Task<ClaimsPrincipal?> GetCachedUserClaims(string userEmail)
    {
        var result = await _cache.GetOrCreateAsync(GetMemoryCacheKey(userEmail),
            async cacheEntry =>
            {
                ApplicationUser dbUser;
                try
                {
                    dbUser = await _userRetrievalService.GetUserByEmailAsync(userEmail);
                }
                catch (NotFoundException)
                {
                    cacheEntry.AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(10);
                    return null;
                }

                cacheEntry.AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(60);
                return await _claimsFactory.CreateAsync(dbUser);
            });

        return result;
    }

    public static object GetMemoryCacheKey(string userEmail) =>
        new { Purpose = "ClaimTransformation", Email = userEmail };
}
