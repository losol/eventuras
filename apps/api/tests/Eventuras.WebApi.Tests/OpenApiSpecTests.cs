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
