using System;
using System.Collections.Concurrent;

namespace Eventuras.Services.Converto;

public class ConvertoTokenCache
{
    private static readonly ConcurrentDictionary<string, CachedToken> _cache = new();

    public static void SetToken(string token, int expiresIn)
    {
        // Subtract a few seconds to be on the safe side
        var expiryTime = DateTime.UtcNow.AddSeconds(expiresIn - 10);
        var cachedToken = new CachedToken { Token = token, Expiry = expiryTime };
        _cache.AddOrUpdate("ConvertoApiToken", cachedToken, (oldkey, oldvalue) => cachedToken);
    }

    public static string GetToken()
    {
        if (_cache.TryGetValue("ConvertoApiToken", out var cachedToken))
        {
            if (DateTime.UtcNow < cachedToken.Expiry)
            {
                return cachedToken.Token;
            }

            _cache.TryRemove("ConvertoApiToken", out cachedToken);
        }

        return null;
    }

    private class CachedToken
    {
        public string Token { get; set; }
        public DateTime Expiry { get; set; }
    }
}
