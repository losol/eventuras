using System;
using System.Collections.Concurrent;

namespace Eventuras.Services.Converto;

public class ConvertoTokenCache
{
    private const string CacheKey = "ConvertoApiToken";
    private static readonly ConcurrentDictionary<string, CachedToken> _cache = new();

    public static void SetToken(string token, int expiresIn)
    {
        // Expire the cached token early so we never hand out one that is about to
        // expire on the Converto side (allowing for clock skew and latency).
        // Converto tokens can be very short-lived (down to ~10s), so cap the buffer
        // at half the lifetime instead of a flat amount that would push a short
        // token's expiry into the past and disable caching entirely.
        var buffer = Math.Min(60, expiresIn / 2);
        var expiryTime = DateTime.UtcNow.AddSeconds(expiresIn - buffer);
        var cachedToken = new CachedToken { Token = token, Expiry = expiryTime };
        _cache.AddOrUpdate(CacheKey, cachedToken, (_, _) => cachedToken);
    }

    public static string GetToken()
    {
        if (_cache.TryGetValue(CacheKey, out var cachedToken))
        {
            if (DateTime.UtcNow < cachedToken.Expiry)
            {
                return cachedToken.Token;
            }

            _cache.TryRemove(CacheKey, out _);
        }

        return null;
    }

    /// <summary>Drops any cached token so the next request fetches a fresh one.</summary>
    public static void Clear() => _cache.TryRemove(CacheKey, out _);

    private class CachedToken
    {
        public string Token { get; set; }
        public DateTime Expiry { get; set; }
    }
}
