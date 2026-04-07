using System;
using System.Collections.Generic;
using System.Text.Json.Nodes;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Services.Constants;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

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

/// <summary>
/// Schema transformer that emits string enum schemas for any C# enum type that is serialised
/// with <see cref="System.Text.Json.Serialization.JsonStringEnumConverter"/>.
///
/// Without this transformer, <c>Microsoft.AspNetCore.OpenApi</c> falls back to emitting
/// <c>{ "type": "integer" }</c> for enum properties, which means the generated SDK loses
/// named member access (e.g. <c>RegistrationStatus.Draft</c>).  With the transformer the
/// spec carries <c>{ "type": "string", "enum": ["Draft", "Verified", ...] }</c>, and the
/// SDK generator produces a proper JavaScript const object.
/// </summary>
public class StringEnumSchemaTransformer : IOpenApiSchemaTransformer
{
    public Task TransformAsync(OpenApiSchema schema, OpenApiSchemaTransformerContext context,
        CancellationToken cancellationToken)
    {
        // Resolve nullable wrapper (e.g. RegistrationStatus?)
        var type = Nullable.GetUnderlyingType(context.JsonTypeInfo.Type) ?? context.JsonTypeInfo.Type;

        if (!type.IsEnum)
        {
            return Task.CompletedTask;
        }

        schema.Type = JsonSchemaType.String;
        schema.Format = null;

        var names = Enum.GetNames(type);
        schema.Enum = new List<JsonNode>(names.Length);
        foreach (var name in names)
        {
            schema.Enum.Add(JsonNode.Parse($"\"{name}\"")!);
        }

        return Task.CompletedTask;
    }
}
