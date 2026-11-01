#nullable enable

using System;
using System.Data.Common;
using System.Linq;
using Npgsql;

namespace Eventuras.Infrastructure;

/// <summary>
///     Caps the Npgsql pool per replica. Npgsql's default (100) is too high when
///     several replicas share one database's connection limit.
/// </summary>
public static class DatabaseConnectionPool
{
    /// <summary>Env: <c>Database__MaxPoolSize</c>.</summary>
    public const string MaxPoolSizeConfigKey = "Database:MaxPoolSize";

    public const int DefaultMaxPoolSize = 20;

    private static readonly string[] MaxPoolSizeKeywords = ["maximumpoolsize", "maxpoolsize"];

    /// <summary>
    ///     Sets Maximum Pool Size to the lowest explicit value (connection string or
    ///     config), or <see cref="DefaultMaxPoolSize" /> if none is set.
    /// </summary>
    public static string ApplyMaxPoolSize(string connectionString, int? configuredMaxPoolSize)
    {
        var effective = GetMaxPoolSize(connectionString, configuredMaxPoolSize);
        var builder = new NpgsqlConnectionStringBuilder(connectionString);

        builder.MaxPoolSize = effective;
        if (builder.MinPoolSize > effective)
        {
            builder.MinPoolSize = effective;
        }

        return builder.ConnectionString;
    }

    /// <summary>The pool size <see cref="ApplyMaxPoolSize" /> would set.</summary>
    public static int GetMaxPoolSize(string connectionString, int? configuredMaxPoolSize)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(connectionString);

        if (configuredMaxPoolSize is < 1)
        {
            throw new ArgumentOutOfRangeException(nameof(configuredMaxPoolSize), configuredMaxPoolSize,
                $"{MaxPoolSizeConfigKey} must be at least 1.");
        }

        int? explicitInConnectionString = HasExplicitMaxPoolSize(connectionString)
            ? new NpgsqlConnectionStringBuilder(connectionString).MaxPoolSize
            : null;

        return new[] { explicitInConnectionString, configuredMaxPoolSize }
            .Where(v => v.HasValue)
            .Select(v => v!.Value)
            .DefaultIfEmpty(DefaultMaxPoolSize)
            .Min();
    }

    private static bool HasExplicitMaxPoolSize(string connectionString)
    {
        var raw = new DbConnectionStringBuilder { ConnectionString = connectionString };
        return raw.Keys.Cast<string>()
            .Select(k => k.Replace(" ", string.Empty).ToLowerInvariant())
            .Any(k => MaxPoolSizeKeywords.Contains(k));
    }
}
