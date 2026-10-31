using System;
using Eventuras.Infrastructure;
using Npgsql;
using Xunit;

namespace Eventuras.WebApi.Tests.Infrastructure;

public class DatabaseConnectionPoolTests
{
    private const string Base = "Host=db;Database=eventuras;Username=eventuras;Password=secret";

    private static int MaxPool(string cs) => new NpgsqlConnectionStringBuilder(cs).MaxPoolSize;

    [Fact]
    public void Applies_default_when_nothing_is_set()
    {
        var result = DatabaseConnectionPool.ApplyMaxPoolSize(Base, null);

        Assert.Equal(DatabaseConnectionPool.DefaultMaxPoolSize, MaxPool(result));
    }

    [Fact]
    public void Default_is_below_npgsql_default()
    {
        Assert.True(DatabaseConnectionPool.DefaultMaxPoolSize < new NpgsqlConnectionStringBuilder().MaxPoolSize);
    }

    [Theory]
    [InlineData("Maximum Pool Size=7")]
    [InlineData("MaxPoolSize=7")]
    [InlineData("maximum pool size=7")]
    public void Keeps_explicit_connection_string_value(string setting)
    {
        var result = DatabaseConnectionPool.ApplyMaxPoolSize($"{Base};{setting}", null);

        Assert.Equal(7, MaxPool(result));
    }

    [Fact]
    public void Explicit_connection_string_value_above_default_is_respected()
    {
        var result = DatabaseConnectionPool.ApplyMaxPoolSize($"{Base};Maximum Pool Size=50", null);

        Assert.Equal(50, MaxPool(result));
    }

    [Fact]
    public void Configured_value_is_used_when_connection_string_has_none()
    {
        var result = DatabaseConnectionPool.ApplyMaxPoolSize(Base, 12);

        Assert.Equal(12, MaxPool(result));
    }

    [Theory]
    [InlineData(30, 10, 10)]
    [InlineData(10, 30, 10)]
    public void Lowest_explicit_value_wins_so_the_cap_never_increases(
        int inConnectionString, int configured, int expected)
    {
        var result = DatabaseConnectionPool.ApplyMaxPoolSize(
            $"{Base};Maximum Pool Size={inConnectionString}", configured);

        Assert.Equal(expected, MaxPool(result));
    }

    [Fact]
    public void Lowers_min_pool_size_when_above_the_cap()
    {
        var result = DatabaseConnectionPool.ApplyMaxPoolSize($"{Base};Minimum Pool Size=50", 10);

        var builder = new NpgsqlConnectionStringBuilder(result);
        Assert.Equal(10, builder.MaxPoolSize);
        Assert.Equal(10, builder.MinPoolSize);
    }

    [Fact]
    public void Preserves_other_settings()
    {
        var result = DatabaseConnectionPool.ApplyMaxPoolSize($"{Base};SSL Mode=Require;Timeout=5", null);

        var builder = new NpgsqlConnectionStringBuilder(result);
        Assert.Equal("db", builder.Host);
        Assert.Equal("secret", builder.Password);
        Assert.Equal(SslMode.Require, builder.SslMode);
        Assert.Equal(5, builder.Timeout);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Rejects_non_positive_configured_value(int configured)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            DatabaseConnectionPool.ApplyMaxPoolSize(Base, configured));
    }

    [Fact]
    public void Total_connections_drop_for_any_replica_count()
    {
        var npgsqlDefault = new NpgsqlConnectionStringBuilder().MaxPoolSize;
        var capped = MaxPool(DatabaseConnectionPool.ApplyMaxPoolSize(Base, null));

        for (var pods = 1; pods <= 10; pods++)
        {
            Assert.True(pods * capped < pods * npgsqlDefault);
        }
    }
}
