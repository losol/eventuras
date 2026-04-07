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
        if (type == typeof(LocalDate))
        {
            format = "date";
        }
        else if (type == typeof(Instant))
        {
            format = "date-time";
        }
        else
        {
            return Task.CompletedTask;
        }

        schema.Type = JsonSchemaType.String;
        schema.Format = format;
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
