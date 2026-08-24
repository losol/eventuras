#nullable enable

using System;
using System.IO;
using System.Text.RegularExpressions;
using Eventuras.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Xunit;

namespace Eventuras.WebApi.Tests;

public class MigrationsScriptTests
{
    private const string RegenerateHint =
        "database-migrations.sql is out of date with the EF Core migrations. " +
        "Regenerate it by running:\n" +
        "  cd apps/api/src/Eventuras.Infrastructure && \\\n" +
        "  dotnet ef migrations script --idempotent \\\n" +
        "    -o sqlscript/database-migrations.sql \\\n" +
        "    --startup-project ../Eventuras.WebApi";

    private static string? GetMigrationsScriptPath()
    {
        var directory = new DirectoryInfo(Directory.GetCurrentDirectory());

        while (directory != null && !File.Exists(Path.Combine(directory.FullName, "Eventuras.slnx")))
        {
            directory = directory.Parent;
        }

        if (directory == null) return null;

        var path = Path.Combine(
            directory.FullName,
            "src", "Eventuras.Infrastructure", "sqlscript", "database-migrations.sql");
        return File.Exists(path) ? path : null;
    }

    // The migration-history inserts embed the EF Core version the script was
    // generated with ("VALUES ('<migration>', '10.0.9')"). That version changes
    // on every EF package bump without any schema change, so it is masked out
    // before comparing — genuine SQL differences still fail the test.
    private static readonly Regex ProductVersionValue = new(
        @"(VALUES \('\d{14}_\w+', ')[^']+('\))",
        RegexOptions.Compiled);

    private static string Normalize(string sql) =>
        ProductVersionValue.Replace(sql.Replace("\r\n", "\n").TrimEnd() + "\n", "$1<ef-version>$2");

    [Fact]
    public void IdempotentMigrationsScript_ShouldBeUpToDate()
    {
        var scriptPath = GetMigrationsScriptPath();
        Assert.NotNull(scriptPath);

        // GenerateScript only inspects the model and migration metadata,
        // so a fake connection string is sufficient — no DB is contacted.
        // UseNodaTime must mirror the runtime registration in
        // Eventuras.WebApi/Extensions/ServiceCollectionExtensions.cs because
        // entities use NodaTime types like LocalDate.
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(
                "Host=localhost;Database=fake;Username=fake;Password=fake",
                o => o.UseNodaTime())
            .Options;

        using var dbContext = new ApplicationDbContext(options);
        var migrator = dbContext.GetService<IMigrator>();
        var generatedScript = migrator.GenerateScript(
            fromMigration: null,
            toMigration: null,
            options: MigrationsSqlGenerationOptions.Idempotent);

        var committedScript = File.ReadAllText(scriptPath!);
        var expected = Normalize(committedScript);
        var actual = Normalize(generatedScript);

        // Print the regenerate hint before asserting so it is visible in the
        // failure output alongside xUnit's string diff, which pinpoints the
        // exact position where the committed script diverges.
        if (expected != actual)
        {
            Console.WriteLine(RegenerateHint);
        }

        Assert.Equal(expected, actual);
    }
}
