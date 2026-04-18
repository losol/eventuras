using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Services.Constants;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;
using NodaTime;

namespace Eventuras.WebApi.Extensions;

public class AddSecuritySchemeTransformer : IOpenApiDocumentTransformer
{
    public Task TransformAsync(OpenApiDocument document, OpenApiDocumentTransformerContext context,
        CancellationToken cancellationToken)
    {
        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();

        document.Components.SecuritySchemes["Bearer"] = new OpenApiSecurityScheme
        {
            Description =
                "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.Http,
            Scheme = "bearer"
        };

        document.Security ??= new List<OpenApiSecurityRequirement>();
        document.Security.Add(new OpenApiSecurityRequirement
        {
            { new OpenApiSecuritySchemeReference("Bearer"), new List<string>() }
        });

        return Task.CompletedTask;
    }
}

public class AddOrganizationHeaderTransformer : IOpenApiOperationTransformer
{
    public Task TransformAsync(OpenApiOperation operation, OpenApiOperationTransformerContext context,
        CancellationToken cancellationToken)
    {
        operation.Parameters ??= new List<IOpenApiParameter>();

        operation.Parameters.Add(new OpenApiParameter
        {
            Name = Api.OrganizationHeader,
            In = ParameterLocation.Header,
            Required = false,
            Schema = new OpenApiSchema { Type = JsonSchemaType.Integer, Format = "int32" },
            Description = "Optional organization Id. Will be required in API version 4."
        });

        return Task.CompletedTask;
    }
}

/// <summary>
/// Schema transformer that narrows numeric schemas back to a single JSON type.
///
/// Microsoft.AspNetCore.OpenApi emits int/long/decimal/double properties as a
/// union of <c>["integer", "string"]</c> (or <c>["number", "string"]</c>) because
/// .NET model binding can parse strings into numeric types via TypeConverter.
/// That theoretical capability leaks into the generated SDK as
/// <c>number | string</c>, which forces every consumer into <c>Number(...)</c> casts.
///
/// We always serialise responses as numeric JSON, so the spec should reflect that.
/// This transformer strips the <c>"string"</c> alternative (and the now-meaningless
/// pattern) from any schema whose underlying CLR type is numeric, while preserving
/// nullability for nullable numeric types (e.g. <c>int?</c>).
/// </summary>
public class NumericSchemaTransformer : IOpenApiSchemaTransformer
{
    public Task TransformAsync(OpenApiSchema schema, OpenApiSchemaTransformerContext context,
        CancellationToken cancellationToken)
    {
        if (!schema.Type.HasValue || !schema.Type.Value.HasFlag(JsonSchemaType.String))
        {
            return Task.CompletedTask;
        }

        var type = System.Nullable.GetUnderlyingType(context.JsonTypeInfo.Type)
                   ?? context.JsonTypeInfo.Type;

        if (!IsNumeric(type))
        {
            return Task.CompletedTask;
        }

        // Drop the "string" alternative, keep any other flags (like Null).
        schema.Type = schema.Type.Value & ~JsonSchemaType.String;
        // Pattern was the integer-as-string validation regex; meaningless now.
        schema.Pattern = null;
        return Task.CompletedTask;
    }

    private static bool IsNumeric(System.Type type) =>
        type == typeof(int) || type == typeof(long) || type == typeof(short) ||
        type == typeof(uint) || type == typeof(ulong) || type == typeof(ushort) ||
        type == typeof(byte) || type == typeof(sbyte) ||
        type == typeof(double) || type == typeof(float) || type == typeof(decimal);
}

/// <summary>
/// Schema transformer that emits ISO 8601 string schemas for NodaTime types.
///
/// Microsoft.AspNetCore.OpenApi only sees the underlying NodaTime structs and
/// emits empty schemas, which the SDK generator turns into <c>unknown</c>.
/// In reality the JSON converters (LocalDateConverter and the NodaTime ones from
/// ConfigureForNodaTime) serialise these as plain ISO strings, so we rewrite the
/// schemas to match.
/// </summary>
public class NodaTimeSchemaTransformer : IOpenApiSchemaTransformer
{
    public Task TransformAsync(OpenApiSchema schema, OpenApiSchemaTransformerContext context,
        CancellationToken cancellationToken)
    {
        var type = System.Nullable.GetUnderlyingType(context.JsonTypeInfo.Type)
                   ?? context.JsonTypeInfo.Type;

        string format;
        string description = string.Empty;
        if (type == typeof(LocalDate))
        {
            format = "date";
        }
        else if (type == typeof(Instant))
        {
            format = "date-time";
        }
        else if (type == typeof(LocalDateTime))
        {
            // RFC 3339 "date-time" implies an offset. LocalDateTime is deliberately
            // timezone-less wall-clock time — a custom format name prevents SDK
            // generators from auto-parsing the string into a native Date/Instant
            // with the wrong interpretation.
            format = "local-date-time";
            description =
                "Wall-clock date and time without timezone. Render verbatim; do not parse "
                + "via `new Date()` or equivalent, which would reinterpret the value in the "
                + "client's local zone.";
        }
        else
        {
            return Task.CompletedTask;
        }

        schema.Type = JsonSchemaType.String;
        schema.Format = format;
        if (description.Length > 0 && string.IsNullOrEmpty(schema.Description))
        {
            schema.Description = description;
        }
        schema.Properties?.Clear();
        return Task.CompletedTask;
    }
}

public class RemoveJsonPatchContentTypeTransformer : IOpenApiOperationTransformer
{
    public Task TransformAsync(OpenApiOperation operation, OpenApiOperationTransformerContext context,
        CancellationToken cancellationToken)
    {
        var contentTypesToRemove = new[] { "application/json-patch+json" };

        if (operation.RequestBody?.Content != null)
        {
            foreach (var contentType in contentTypesToRemove)
            {
                operation.RequestBody.Content.Remove(contentType);
            }
        }

        if (operation.Responses != null)
        {
            foreach (var response in operation.Responses)
            {
                if (response.Value.Content == null) continue;
                foreach (var contentType in contentTypesToRemove)
                {
                    response.Value.Content.Remove(contentType);
                }
            }
        }

        return Task.CompletedTask;
    }
}
