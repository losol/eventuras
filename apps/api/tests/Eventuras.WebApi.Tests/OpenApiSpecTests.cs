#nullable enable

using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;

namespace Eventuras.WebApi.Tests;

public class OpenApiSpecTests : IClassFixture<CustomWebApiApplicationFactory<Program>>
{
    private readonly CustomWebApiApplicationFactory<Program> _factory;
    public OpenApiSpecTests(CustomWebApiApplicationFactory<Program> factory) => _factory = factory;

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
}
