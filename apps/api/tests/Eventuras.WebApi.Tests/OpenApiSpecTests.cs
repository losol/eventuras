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

    private static string GetOpenApiSpecPath()
    {
        // Find the API project root by looking for the .slnx file
        var directory = new DirectoryInfo(Directory.GetCurrentDirectory());

        while (directory != null && !File.Exists(Path.Combine(directory.FullName, "Eventuras.slnx")))
        {
            directory = directory.Parent;
        }

        if (directory == null)
        {
            throw new DirectoryNotFoundException(
                "Could not find API project root. Expected to find Eventuras.slnx in parent directories.");
        }

        return Path.Combine(directory.FullName, "docs", "eventuras-v3.json");
    }

    [Fact]
    public void OpenApiSpec_ShouldExist()
    {
        // Arrange
        var openApiSpecPath = GetOpenApiSpecPath();

        // Act & Assert
        Assert.True(
            File.Exists(openApiSpecPath),
            $"OpenAPI spec file not found at: {openApiSpecPath}. " +
            "Please run 'pnpm --filter @eventuras/api openapi:update' to generate it."
        );
    }

    [Fact]
    public void OpenApiSpec_ShouldBeValidJson()
    {
        // Arrange
        var openApiSpecPath = GetOpenApiSpecPath();

        // Skip if file doesn't exist (let the other test fail)
        if (!File.Exists(openApiSpecPath))
        {
            return;
        }

        // Act
        var jsonContent = File.ReadAllText(openApiSpecPath);

        // Assert - try to parse as JSON
        var exception = Record.Exception(() =>
            JsonDocument.Parse(jsonContent)
        );

        Assert.Null(exception);
    }

    [Fact]
    public void OpenApiSpec_ShouldContainRequiredOpenApiFields()
    {
        // Arrange
        var openApiSpecPath = GetOpenApiSpecPath();

        // Skip if file doesn't exist (let the other test fail)
        if (!File.Exists(openApiSpecPath))
        {
            return;
        }

        // Act
        var jsonContent = File.ReadAllText(openApiSpecPath);
        using var document = JsonDocument.Parse(jsonContent);
        var root = document.RootElement;

        // Assert - check for required OpenAPI 3.0 fields
        Assert.True(root.TryGetProperty("openapi", out var openApiVersion),
            "OpenAPI spec must contain 'openapi' version field");
        Assert.StartsWith("3.0", openApiVersion.GetString());

        Assert.True(root.TryGetProperty("info", out _),
            "OpenAPI spec must contain 'info' section");

        Assert.True(root.TryGetProperty("paths", out var paths),
            "OpenAPI spec must contain 'paths' section");

        var pathCount = paths.EnumerateObject().Count();
        Assert.True(pathCount > 0,
            $"OpenAPI spec 'paths' section should not be empty. Found {pathCount} paths.");

        Assert.True(root.TryGetProperty("components", out var components),
            "OpenAPI spec must contain 'components' section");
        Assert.True(components.TryGetProperty("schemas", out var schemas),
            "OpenAPI spec components must contain 'schemas'");

        var schemaCount = schemas.EnumerateObject().Count();
        Assert.True(schemaCount > 0,
            $"OpenAPI spec should contain at least one schema definition. Found {schemaCount} schemas.");
    }

    [Fact]
    public async Task OpenApiSpec_ShouldMatchGeneratedSpec()
    {
        // Arrange
        var openApiSpecPath = GetOpenApiSpecPath();

        // Skip if file doesn't exist (let the other test fail)
        if (!File.Exists(openApiSpecPath))
        {
            return;
        }

        // Act - Get the OpenAPI spec from the running API
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/swagger/v3/swagger.json");

        Assert.True(response.IsSuccessStatusCode,
            "Failed to fetch OpenAPI spec from running API at /swagger/v3/swagger.json");

        var generatedSpec = await response.Content.ReadAsStringAsync();
        var committedSpec = await File.ReadAllTextAsync(openApiSpecPath);

        // Normalize JSON for comparison (remove whitespace differences)
        using var generatedDoc = JsonDocument.Parse(generatedSpec);
        using var committedDoc = JsonDocument.Parse(committedSpec);

        var generatedNormalized = JsonSerializer.Serialize(
            generatedDoc.RootElement,
            new JsonSerializerOptions { WriteIndented = false }
        );
        var committedNormalized = JsonSerializer.Serialize(
            committedDoc.RootElement,
            new JsonSerializerOptions { WriteIndented = false }
        );

        // Assert
        Assert.True(committedNormalized == generatedNormalized,
            "OpenAPI spec file (docs/eventuras-v3.json) is out of date. " +
            "Please run 'pnpm --filter @eventuras/api openapi:update' to regenerate it.");
    }
}
