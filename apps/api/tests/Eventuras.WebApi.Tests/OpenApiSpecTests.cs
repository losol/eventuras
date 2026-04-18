#nullable enable

using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;

namespace Eventuras.WebApi.Tests;

public class OpenApiSpecTests : IClassFixture<CustomWebApiApplicationFactory<Program>>
{
    private readonly CustomWebApiApplicationFactory<Program> _factory;
    public OpenApiSpecTests(CustomWebApiApplicationFactory<Program> factory) => _factory = factory;

    private static string? GetOpenApiSpecPath()
    {
        var directory = new DirectoryInfo(Directory.GetCurrentDirectory());

        while (directory != null && !File.Exists(Path.Combine(directory.FullName, "Eventuras.slnx")))
        {
            directory = directory.Parent;
        }

        if (directory == null) return null;

        var path = Path.Combine(directory.FullName, "docs", "eventuras-v3.json");
        return File.Exists(path) ? path : null;
    }

    [Fact]
    public async Task OpenApiSpec_ShouldBeValidAndContainEndpoints()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/openapi/v3.json");

        Assert.True(response.IsSuccessStatusCode,
            "Failed to fetch OpenAPI spec from /openapi/v3.json");

        var content = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(content);
        var root = document.RootElement;

        Assert.True(root.TryGetProperty("openapi", out var version),
            "OpenAPI spec must contain 'openapi' version field");
        Assert.StartsWith("3.", version.GetString());

        Assert.True(root.TryGetProperty("paths", out var paths),
            "OpenAPI spec must contain 'paths' section");
        var pathCount = paths.EnumerateObject().Count();
        Assert.True(pathCount > 0, $"Expected endpoints but found {pathCount} paths");

        Assert.True(root.TryGetProperty("components", out var components),
            "OpenAPI spec must contain 'components' section");
        Assert.True(components.TryGetProperty("schemas", out var schemas),
            "Components must contain 'schemas'");
        Assert.True(schemas.EnumerateObject().Count() > 0, "Expected at least one schema");
    }

    [Fact]
    public async Task OpenApiSpec_EnumsShouldBeSerializedAsNamedStrings()
    {
        // Microsoft.AspNetCore.OpenApi reads the Minimal API JSON options
        // (ConfigureHttpJsonOptions in Program.cs), not the MVC ones. If those
        // options are missing the JsonStringEnumConverter, enums end up as
        // { "type": "integer" } and the generated SDK loses named member access
        // (RegistrationStatus becomes a bare number). This test guards against
        // that regression.
        // See https://github.com/dotnet/aspnetcore/issues/61303
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/openapi/v3.json");
        Assert.True(response.IsSuccessStatusCode);

        var content = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(content);
        var schemas = document.RootElement.GetProperty("components").GetProperty("schemas");

        Assert.True(schemas.TryGetProperty("RegistrationStatus", out var registrationStatus),
            "RegistrationStatus schema must be present");
        Assert.True(registrationStatus.TryGetProperty("enum", out var enumValues),
            "RegistrationStatus must carry named enum values, not be emitted as a bare integer");

        var values = enumValues.EnumerateArray().Select(v => v.GetString()).ToList();
        Assert.Contains("Draft", values);
        Assert.Contains("Verified", values);

        // Schema must NOT be { "type": "integer" } — that means the converter
        // is not being seen by the schema generator.
        if (registrationStatus.TryGetProperty("type", out var typeProp))
        {
            Assert.NotEqual("integer", typeProp.GetString());
        }
    }

    [Fact]
    public async Task OpenApiSpec_LocalDateTimeShouldUseCustomFormat()
    {
        // NodaTime's LocalDateTime is serialised as a timezone-less ISO 8601
        // string. The default OpenApi schema for it is { } which the SDK
        // generator turns into `unknown`. NodaTimeSchemaTransformer rewrites
        // it to { type: "string", format: "local-date-time" }. The custom
        // format name (not "date-time") prevents SDK generators from
        // auto-parsing the value into a native Date/Instant and reinterpreting
        // it in the client's timezone.
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/openapi/v3.json");
        Assert.True(response.IsSuccessStatusCode);

        var content = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(content);
        var schemas = document.RootElement.GetProperty("components").GetProperty("schemas");

        Assert.True(schemas.TryGetProperty("LocalDateTime", out var localDateTime),
            "LocalDateTime schema must be present");

        Assert.True(localDateTime.TryGetProperty("type", out var typeProp),
            "LocalDateTime schema must declare a type (not be an empty object)");
        Assert.Equal("string", typeProp.GetString());

        Assert.True(localDateTime.TryGetProperty("format", out var formatProp),
            "LocalDateTime schema must declare a format");
        Assert.Equal("local-date-time", formatProp.GetString());

        // RegistrationDto.registrationTime must reference the LocalDateTime schema.
        var registrationDto = schemas.GetProperty("RegistrationDto");
        var properties = registrationDto.GetProperty("properties");
        var registrationTime = properties.GetProperty("registrationTime");

        // Nullable references use oneOf [{ $ref }, { type: "null" }].
        var refString = registrationTime.TryGetProperty("$ref", out var directRef)
            ? directRef.GetString()
            : registrationTime.GetProperty("oneOf")
                .EnumerateArray()
                .Select(e => e.TryGetProperty("$ref", out var r) ? r.GetString() : null)
                .FirstOrDefault(s => s != null);

        Assert.Equal("#/components/schemas/LocalDateTime", refString);
    }

    [Fact]
    public async Task OpenApiSpec_DiffCheck()
    {
        var specPath = GetOpenApiSpecPath();
        if (specPath == null)
        {
            Console.WriteLine("No committed spec file found, skipping diff check.");
            return;
        }

        var client = _factory.CreateClient();
        var response = await client.GetAsync("/openapi/v3.json");
        Assert.True(response.IsSuccessStatusCode);

        var generatedSpec = await response.Content.ReadAsStringAsync();
        var committedSpec = await File.ReadAllTextAsync(specPath);

        var normalize = new JsonSerializerOptions { WriteIndented = false };
        using var generatedDoc = JsonDocument.Parse(generatedSpec);
        using var committedDoc = JsonDocument.Parse(committedSpec);

        var generatedNormalized = JsonSerializer.Serialize(generatedDoc.RootElement, normalize);
        var committedNormalized = JsonSerializer.Serialize(committedDoc.RootElement, normalize);

        if (committedNormalized != generatedNormalized)
        {
            Console.WriteLine("⚠ OpenAPI spec has changed. Run 'pnpm --filter @eventuras/api openapi:update' to update.");
            Console.WriteLine("");

            // Show which paths changed
            var committedPaths = committedDoc.RootElement.GetProperty("paths").EnumerateObject().Select(p => p.Name).ToHashSet();
            var generatedPaths = generatedDoc.RootElement.GetProperty("paths").EnumerateObject().Select(p => p.Name).ToHashSet();

            foreach (var added in generatedPaths.Except(committedPaths))
                Console.WriteLine($"  + {added}");
            foreach (var removed in committedPaths.Except(generatedPaths))
                Console.WriteLine($"  - {removed}");

            var commonPaths = committedPaths.Intersect(generatedPaths);
            Console.WriteLine($"  {commonPaths.Count()} paths unchanged, {generatedPaths.Except(committedPaths).Count()} added, {committedPaths.Except(generatedPaths).Count()} removed");
        }
        else
        {
            Console.WriteLine("✓ OpenAPI spec is up to date.");
        }
    }
}
