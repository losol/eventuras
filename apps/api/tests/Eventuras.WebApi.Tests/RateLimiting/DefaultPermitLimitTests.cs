#nullable enable

using System.Collections.Generic;
using Eventuras.WebApi.Extensions;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Eventuras.WebApi.Tests.RateLimiting;

public class DefaultPermitLimitTests
{
    private const string Base = "Host=db;Database=eventuras;Username=eventuras;Password=secret";

    private static int DefaultFor(string? connectionString, string? maxPoolSize = null) =>
        RateLimitingExtensions.GetDefaultPermitLimit(new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = connectionString,
                ["Database:MaxPoolSize"] = maxPoolSize,
            })
            .Build());

    [Theory]
    [InlineData(Base, null, 10)] // default pool 20
    [InlineData(Base + ";Maximum Pool Size=100", null, 10)]
    [InlineData(Base + ";Maximum Pool Size=7", null, 3)]
    [InlineData(Base + ";Maximum Pool Size=1", null, 1)]
    [InlineData(Base, "6", 3)]
    [InlineData(null, null, 10)]
    public void Leaves_at_least_half_the_pool_for_other_traffic(
        string? connectionString, string? maxPoolSize, int expected) =>
        Assert.Equal(expected, DefaultFor(connectionString, maxPoolSize));
}
